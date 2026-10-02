import json
import logging
import re
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.lead import AIAnalysisResult, LeadCreate, CopilotChatMessage
from app.prompts.lead_prompts import LEAD_ANALYSIS_SYSTEM_PROMPT, COPILOT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.model_name = settings.GEMINI_MODEL or "gemini-3.1-flash-lite"
        self.groq_model = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
        self._client = None
        self._init_client()

    def _init_client(self):
        """Initializes the Gemini client, reading the API key fresh from environment."""
        from dotenv import load_dotenv
        import os
        load_dotenv(override=True)
        api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        if api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=api_key)
                logger.info("Gemini client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai client: {e}")
        else:
            logger.warning("No GEMINI_API_KEY found. Will try Grok fallback.")

    @property
    def client(self):
        """Returns client, attempting re-init if not yet initialized."""
        if not self._client:
            self._init_client()
        return self._client

    def _get_groq_api_key(self) -> str:
        """Reads Groq API key fresh from environment."""
        from dotenv import load_dotenv
        import os
        load_dotenv(override=True)
        return (os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY or "").strip()

    def _groq_analyze_lead(self, lead_data: LeadCreate) -> AIAnalysisResult:
        """
        Calls Groq API (groq.com) to analyze a lead using fast Llama inference.
        Uses the official groq Python SDK with json_object response format.
        """
        from groq import Groq
        groq_key = self._get_groq_api_key()
        if not groq_key:
            raise ValueError("No GROQ_API_KEY configured.")

        user_prompt = (
            f"Analyze the following Real Estate Inbound Lead:\n\n"
            f"Customer Name: {lead_data.name}\n"
            f"Preferred Location: {lead_data.location}\n"
            f"Property Requirement: {lead_data.property_requirement}\n"
            f"Stated Budget: {lead_data.budget}\n"
            f"Buying Timeline: {lead_data.buying_timeline}\n"
            f'Customer Inquiry: "{lead_data.customer_message}"'
        )

        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            model=self.groq_model,
            messages=[
                {"role": "system", "content": LEAD_ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        raw_text = completion.choices[0].message.content or ""
        cleaned = self._clean_json_string(raw_text)
        data = json.loads(cleaned)
        logger.info(f"Groq API: lead analysis succeeded using {self.groq_model}.")
        return AIAnalysisResult(**data)

    def _groq_copilot_chat(self, context: str, question: str) -> str:
        """
        Calls Groq API (groq.com) for a grounded copilot response.
        Uses Llama running on Groq LPU for ultra-fast inference.
        """
        from groq import Groq
        groq_key = self._get_groq_api_key()
        if not groq_key:
            raise ValueError("No GROQ_API_KEY configured.")

        user_msg = (
            f"{context}\n\n"
            f"SALESPERSON QUESTION:\n{question}\n\n"
            f"Answer ONLY using the lead data above. Cite specific fields. Be concise and direct:"
        )
        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            model=self.groq_model,
            messages=[
                {"role": "system", "content": COPILOT_SYSTEM_PROMPT},
                {"role": "user", "content": user_msg}
            ],
            temperature=0.1,
            max_tokens=512
        )
        text = completion.choices[0].message.content or ""
        logger.info(f"Groq API: copilot response succeeded using {self.groq_model}.")
        return text

    def analyze_lead(self, lead_data: LeadCreate) -> AIAnalysisResult:
        """
        Analyzes a lead. Chain: Gemini -> Groq (Llama) -> Rule-based fallback.
        """
        user_prompt = f"""
Analyze the following Real Estate Inbound Lead:

Customer Name: {lead_data.name}
Preferred Location: {lead_data.location}
Property Requirement: {lead_data.property_requirement}
Stated Budget: {lead_data.budget}
Buying Timeline: {lead_data.buying_timeline}
Customer Inquiry / Transcript:
"{lead_data.customer_message}"
"""
        # --- 1. Try Gemini ---
        if self.client:
            try:
                from google.genai import types
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=LEAD_ANALYSIS_SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        temperature=0.2
                    )
                )
                raw_text = response.text or ""
                cleaned_json = self._clean_json_string(raw_text)
                data = json.loads(cleaned_json)
                logger.info("Lead analysis: Gemini succeeded.")
                return AIAnalysisResult(**data)
            except Exception as e:
                logger.warning(f"Gemini lead analysis failed: {e}. Trying Groq...")

        # --- 2. Try Groq ---
        if self._get_groq_api_key():
            try:
                return self._groq_analyze_lead(lead_data)
            except Exception as e:
                logger.warning(f"Groq lead analysis failed: {e}. Using rule-based fallback.")

        # --- 3. Rule-based fallback ---
        logger.info("Both AI providers failed. Using intelligent rule-based analysis.")
        return self._fallback_analysis(lead_data)

    def copilot_chat(self, lead_info: Dict[str, Any], question: str, history: List[CopilotChatMessage]) -> str:
        """
        Generates a strictly grounded response for salesperson questions about a specific lead.
        Only uses facts from the lead form and AI analysis — no hallucination.
        """
        ai = lead_info.get('ai_analysis', {})

        # Build a comprehensive context block from ALL available lead fields
        context_str = f"""============================================
LEAD PROFILE DATA (Source of Truth - Use ONLY this data)
============================================
Name:                {lead_info.get('name')}
Location:            {lead_info.get('location')}
Property Req:        {lead_info.get('property_requirement')}
Budget:              {lead_info.get('budget')}
Buying Timeline:     {lead_info.get('buying_timeline')}
Priority Label:      {lead_info.get('priority_label')} (Score: {lead_info.get('priority_score')}/100)

Customer's Own Message (verbatim from inquiry form):
\"{lead_info.get('customer_message')}\"

============================================
AI ANALYSIS (Derived strictly from the above)
============================================
Summary:             {ai.get('summary')}
Intent:              {ai.get('intent')}
Intent Score:        {ai.get('intent_score')}/100
Timeline Score:      {ai.get('timeline_score')}/100
Requirement Score:   {ai.get('requirement_score')}/100
Budget Clarity:      {ai.get('budget_clarity_score')}/100

Key Requirements:
{chr(10).join(f'  - {r}' for r in ai.get('key_requirements', []))}

Identified Objections / Concerns:
{chr(10).join(f'  - {o}' for o in ai.get('objections', []))}

Recommended Next Action:
  {ai.get('recommended_action')}

AI Suggested Response to Customer:
  {ai.get('suggested_response')}

Priority Reasons:
{chr(10).join(f'  - {r}' for r in ai.get('priority_reasons', []))}
"""

        formatted_history = ""
        if history:
            formatted_history = "--------------------------------------------\nCONVERSATION HISTORY\n--------------------------------------------\n"
            formatted_history += "\n".join([f"{msg.sender.upper()}: {msg.text}" for msg in history]) + "\n"

        contents = f"""{context_str}
{formatted_history}
--------------------------------------------
SALESPERSON QUESTION:
{question}
--------------------------------------------

Answer ONLY using the lead data above. Cite specific fields. Be concise and direct:"""

        # --- 1. Try Gemini ---
        if self.client:
            try:
                from google.genai import types
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=COPILOT_SYSTEM_PROMPT,
                        temperature=0.1,
                        max_output_tokens=512
                    )
                )
                if response.text:
                    logger.info("Copilot: Gemini succeeded.")
                    return response.text
                logger.warning("Gemini returned empty text. Trying Groq...")
            except Exception as e:
                logger.warning(f"Gemini copilot error: {e}. Trying Groq...")

        # --- 2. Try Groq ---
        if self._get_groq_api_key():
            try:
                return self._groq_copilot_chat(context_str, question)
            except Exception as e:
                logger.warning(f"Groq copilot error: {e}. Using rule-based fallback.")

        # --- 3. Rule-based fallback ---
        logger.info("Both AI providers failed. Using rule-based copilot response.")
        return self._fallback_copilot_response(lead_info, question)

    def _clean_json_string(self, text: str) -> str:
        """Strips markdown code blocks (```json ... ```) and whitespace."""
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        return text.strip()

    def _fallback_analysis(self, lead: LeadCreate) -> AIAnalysisResult:
        """Intelligent fallback structured analysis if AI API is unavailable."""
        msg_lower = lead.customer_message.lower()
        req_lower = lead.property_requirement.lower()
        tl_lower = lead.buying_timeline.lower()

        # Heuristic scoring calculations for fallback
        intent_score = 75
        if "ready" in msg_lower or "immediate" in tl_lower or "30 days" in tl_lower or "urgent" in msg_lower:
            intent_score = 90
        elif "exploring" in msg_lower or "just looking" in msg_lower:
            intent_score = 40

        timeline_score = 70
        if "30 days" in tl_lower or "immediate" in tl_lower or "lease ends" in msg_lower:
            timeline_score = 95
        elif "6 months" in tl_lower or "future" in tl_lower:
            timeline_score = 35

        requirement_score = 80 if len(lead.property_requirement) > 10 else 50
        budget_clarity_score = 85 if any(char.isdigit() for char in lead.budget) else 45

        return AIAnalysisResult(
            summary=f"Inquiry from {lead.name} seeking {lead.property_requirement} in {lead.location} within {lead.buying_timeline}.",
            intent="Urgent Ready-to-Move Buyer" if intent_score >= 80 else "Standard Property Inquiry",
            intent_score=intent_score,
            timeline_score=timeline_score,
            requirement_score=requirement_score,
            budget_clarity_score=budget_clarity_score,
            key_requirements=[
                f"Location: {lead.location}",
                f"Type: {lead.property_requirement}",
                f"Budget Limit: {lead.budget}"
            ],
            objections=[
                "Potential price negotiation expected",
                "Requires confirmation on possession date/ready status"
            ],
            recommended_action=f"Call {lead.name} immediately to share 2-3 verified listings matching {lead.property_requirement} in {lead.location}.",
            suggested_response=f"Hi {lead.name}, thank you for reaching out regarding your requirement for a {lead.property_requirement} in {lead.location}. I have 2 premium options within your budget of {lead.budget} available right now. When would be a good time for a quick 5-minute call today?",
            priority_reasons=[
                f"Timeline specified as '{lead.buying_timeline}'",
                f"Budget clear at {lead.budget}",
                f"Specific property request: {lead.property_requirement}"
            ]
        )

    def _fallback_copilot_response(self, lead_info: Dict[str, Any], question: str) -> str:
        """Strictly data-grounded fallback that only uses actual lead field values."""
        q_lower = question.lower()
        name = lead_info.get("name", "the customer")
        budget = lead_info.get("budget", "not specified")
        location = lead_info.get("location", "not specified")
        req = lead_info.get("property_requirement", "not specified")
        timeline = lead_info.get("buying_timeline", "not specified")
        message = lead_info.get("customer_message", "")
        priority = lead_info.get("priority_label", "UNKNOWN")
        score = lead_info.get("priority_score", "N/A")
        ai = lead_info.get("ai_analysis", {})
        objections = ai.get("objections", [])
        key_reqs = ai.get("key_requirements", [])
        action = ai.get("recommended_action", "")
        suggested_response = ai.get("suggested_response", "")
        intent = ai.get("intent", "")
        summary = ai.get("summary", "")
        priority_reasons = ai.get("priority_reasons", [])

        if any(kw in q_lower for kw in ["budget", "price", "cost", "afford", "pay", "spend"]):
            msg_snippet = f'"{message[:200]}..."' if len(message) > 200 else f'"{message}"'
            budget_clarity = ai.get('budget_clarity_score')
            result = (
                f"**{name}'s Budget (from lead form):**\n"
                f"- Stated budget: **{budget}**\n"
                f"- Per their message: {msg_snippet}"
            )
            if budget_clarity:
                result += f"\n\nBudget clarity score: {budget_clarity}/100"
            return result

        elif any(kw in q_lower for kw in ["location", "area", "where", "place"]):
            return (
                f"**{name}'s Preferred Location (from lead form):**\n"
                f"- Stated location: **{location}**\n"
                + (f"- Key location requirements:\n" + "\n".join(f"  - {r}" for r in key_reqs if "location" in r.lower() or "metro" in r.lower() or "area" in r.lower()) if key_reqs else "")
            )

        elif any(kw in q_lower for kw in ["concern", "objection", "worry", "risk", "problem", "issue"]):
            if objections:
                return (
                    f"**Identified Concerns for {name} (from AI analysis):**\n"
                    + "\n".join(f"- {o}" for o in objections)
                )
            return f"No specific objections were detected in {name}'s inquiry. Their message: \"{message}\""

        elif any(kw in q_lower for kw in ["requirement", "need", "want", "looking for", "property"]):
            if key_reqs:
                return (
                    f"**{name}'s Stated Requirements (from lead form + analysis):**\n"
                    + "\n".join(f"- {r}" for r in key_reqs)
                    + f"\n\nProperty requested: **{req}**"
                )
            return f"**Property Requirement:** {req}\n**Location:** {location}\n**Budget:** {budget}"

        elif any(kw in q_lower for kw in ["timeline", "urgent", "when", "deadline", "soon", "days", "month"]):
            return (
                f"**{name}'s Buying Timeline (from lead form):**\n"
                f"- Stated timeline: **{timeline}**\n"
                f"- Timeline urgency score: {ai.get('timeline_score', 'N/A')}/100\n"
                + (f"- Context from message: \"{message[:200]}\"" if message else "")
            )

        elif any(kw in q_lower for kw in ["priority", "score", "hot", "warm", "cold", "rank"]):
            return (
                f"**{name}'s Priority Status:**\n"
                f"- Label: **{priority}** | Score: **{score}/100**\n"
                + ("- Reasons:\n" + "\n".join(f"  - {r}" for r in priority_reasons) if priority_reasons else "")
            )

        elif any(kw in q_lower for kw in ["emphasize", "call", "pitch", "talk", "speak", "highlight", "next", "action", "do"]):
            return (
                f"**Recommended Action for {name}:**\n"
                f"- {action}\n\n"
                f"**Key points to emphasize (from their profile):**\n"
                f"- Property need: {req} in {location}\n"
                f"- Budget: {budget}\n"
                f"- Timeline: {timeline}\n"
                + (f"\n**Address these concerns:**\n" + "\n".join(f"- {o}" for o in objections) if objections else "")
            )

        elif any(kw in q_lower for kw in ["reply", "message", "send", "respond", "write", "draft", "assertive"]):
            if suggested_response:
                return f"**AI Suggested Response for {name}:**\n\n{suggested_response}"
            return f"**Suggested message:**\n\"Hi {name}, I have options matching your requirement for {req} in {location} within {budget}. Given your {timeline} timeline, shall we connect today?\""

        elif any(kw in q_lower for kw in ["summary", "overview", "who", "tell me about", "about"]):
            return f"**Lead Summary for {name}:**\n{summary}\n\n- Intent: {intent}\n- Priority: {priority} ({score}/100)"

        else:
            # Generic fallback — still only uses actual data
            return (
                f"**{name}'s Profile Summary:**\n"
                f"- Budget: {budget}\n"
                f"- Location: {location}\n"
                f"- Requirement: {req}\n"
                f"- Timeline: {timeline}\n"
                f"- Priority: {priority} ({score}/100)\n\n"
                f"**Recommended Action:** {action}"
            )

ai_service = AIService()
