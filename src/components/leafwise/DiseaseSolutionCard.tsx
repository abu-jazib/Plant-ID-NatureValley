
import type { SuggestPlantTreatmentOutput } from "@/ai/flows/suggest-treatment-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ShieldPlus, Zap } from "lucide-react";

interface DiseaseSolutionCardProps {
  result: SuggestPlantTreatmentOutput;
  language: "en" | "ur";
}

export function DiseaseSolutionCard({ result, language }: DiseaseSolutionCardProps) {
  const isUrdu = language === "ur";

  const cardTitle = isUrdu ? "علاج اور روک تھام" : "Treatment & Prevention";
  const solutionsLabel = isUrdu ? "تجویز کردہ حل:" : "Suggested Solutions:";
  const preventionLabel = isUrdu ? "احتیاطی تدابیر:" : "Preventative Measures:";
  
  const solutionsText = isUrdu ? (result.suggestedSolutionsUrdu || result.suggestedSolutions) : result.suggestedSolutions;
  const preventionText = isUrdu ? (result.preventativeMeasuresUrdu || result.preventativeMeasures) : result.preventativeMeasures;

  return (
    <Card className="shadow-lg">
      <CardHeader dir={isUrdu ? "rtl" : "ltr"}>
        <CardTitle className={`text-xl flex items-center ${isUrdu ? "font-jameel justify-end flex-row-reverse" : "font-sans"}`}>
          <Lightbulb className={`${isUrdu ? "ml-2" : "mr-2"} text-primary`} />
          {cardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-4 ${isUrdu ? "font-jameel text-right" : "font-sans"}`} dir={isUrdu ? "rtl" : "ltr"}>
        <div>
          <h3 className={`font-semibold text-primary flex items-center mb-2 ${isUrdu ? "font-jameel justify-end flex-row-reverse" : "font-sans"}`}>
            <Zap className={`h-5 w-5 ${isUrdu ? "ml-2" : "mr-2"}`} />
            {solutionsLabel}
          </h3>
          <p className={`text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md ${isUrdu ? "font-jameel" : "font-sans"}`}>{solutionsText}</p>
        </div>
        <div>
          <h3 className={`font-semibold text-primary flex items-center mb-2 ${isUrdu ? "font-jameel justify-end flex-row-reverse" : "font-sans"}`}>
            <ShieldPlus className={`h-5 w-5 ${isUrdu ? "ml-2" : "mr-2"}`} />
            {preventionLabel}
          </h3>
          <p className={`text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md ${isUrdu ? "font-jameel" : "font-sans"}`}>{preventionText}</p>
        </div>
      </CardContent>
    </Card>
  );
}

