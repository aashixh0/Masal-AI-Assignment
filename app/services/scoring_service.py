from typing import Tuple, List
from app.schemas.lead import AIAnalysisResult

class ScoringService:
    @staticmethod
    def calculate_priority(analysis: AIAnalysisResult) -> Tuple[float, str, List[str]]:
        """
        Calculates the deterministic priority score using the formula:
        priority_score = (intent_score * 0.35) + (timeline_score * 0.30) + (requirement_score * 0.20) + (budget_clarity_score * 0.15)
        
        Maps:
        80 - 100 -> HOT
        50 - 79  -> WARM
        0  - 49  -> COLD
        """
        score = (
            (analysis.intent_score * 0.35) +
            (analysis.timeline_score * 0.30) +
            (analysis.requirement_score * 0.20) +
            (analysis.budget_clarity_score * 0.15)
        )
        
        # Round score to 1 decimal place or whole integer
        final_score = round(score, 1)
        
        if final_score >= 80:
            label = "HOT"
        elif final_score >= 50:
            label = "WARM"
        else:
            label = "COLD"

        # Generate explainable reasons
        reasons: List[str] = []
        
        if analysis.intent_score >= 80:
            reasons.append(f"Strong purchase intent detected ({analysis.intent_score}/100)")
        elif analysis.intent_score < 50:
            reasons.append(f"Low purchase intent or early inquiry ({analysis.intent_score}/100)")

        if analysis.timeline_score >= 80:
            reasons.append(f"Urgent buying timeline ({analysis.timeline_score}/100)")
        elif analysis.timeline_score < 50:
            reasons.append(f"Long or vague buying timeline ({analysis.timeline_score}/100)")

        if analysis.requirement_score >= 80:
            reasons.append(f"Specific & clear property requirements ({analysis.requirement_score}/100)")

        if analysis.budget_clarity_score >= 80:
            reasons.append(f"Realistic & well-defined budget ({analysis.budget_clarity_score}/100)")
        elif analysis.budget_clarity_score < 50:
            reasons.append(f"Unclear or constrained budget ({analysis.budget_clarity_score}/100)")

        # Combine with AI suggested priority reasons if any
        if analysis.priority_reasons:
            for ai_reason in analysis.priority_reasons:
                if ai_reason not in reasons:
                    reasons.append(ai_reason)

        if not reasons:
            reasons.append(f"Balanced overall lead profile with score {final_score}/100")

        return final_score, label, reasons

scoring_service = ScoringService()
