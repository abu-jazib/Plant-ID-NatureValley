
import type { DetectDiseaseFromImageOutput } from "@/ai/flows/detect-disease-from-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DiseaseDetectionCardProps {
  result: DetectDiseaseFromImageOutput;
  language: "en" | "ur";
}

export function DiseaseDetectionCard({ result, language }: DiseaseDetectionCardProps) {
  const isUrdu = language === "ur";

  const cardTitle = isUrdu ? "بیماری کی تشخیص" : "Disease Detection";
  const statusLabel = isUrdu ? "کیفیت:" : "Status:";
  const healthyText = isUrdu ? (result.diseaseStatusUrdu || "صحت مند") : "Healthy";
  const diseaseDetectedText = isUrdu ? (result.diseaseStatusUrdu || "بیماری/خرابی کا پتہ چلا") : "Disease/Abnormality Detected";
  const likelyCausesLabel = isUrdu ? "ممکنہ وجوہات:" : "Likely Causes:";
  const likelyCausesText = isUrdu ? (result.likelyCausesUrdu || result.likelyCauses) : result.likelyCauses;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className={`text-xl ${isUrdu ? "font-jameel text-right" : "font-sans"}`}>
          {cardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-3 ${isUrdu ? "font-jameel text-right" : "font-sans"}`} dir={isUrdu ? "rtl" : "ltr"}>
        <div>
          <h3 className={`font-semibold text-primary flex items-center ${isUrdu ? "justify-start" : ""}`}>
            {statusLabel}
            {result.diseaseDetected ? (
              <Badge variant="destructive" className={`font-sans ${isUrdu ? "mr-2 ml-0 font-jameel" : "ml-2"}`}>
                <AlertTriangle className={`h-4 w-4 ${isUrdu ? "ml-1" : "mr-1"}`} /> {diseaseDetectedText}
              </Badge>
            ) : (
              <Badge variant="default" className={`font-sans bg-primary hover:bg-primary/90 ${isUrdu ? "mr-2 ml-0 font-jameel" : "ml-2"}`}>
                <ShieldCheck className={`h-4 w-4 ${isUrdu ? "ml-1" : "mr-1"}`} /> {healthyText}
              </Badge>
            )}
          </h3>
        </div>
        {result.diseaseDetected && (
          <div>
            <h3 className={`font-semibold text-primary flex items-center ${isUrdu ? "justify-start" : ""}`}>
                <ListChecks className={`h-4 w-4 ${isUrdu ? "ml-1" : "mr-1"}`} />
                {likelyCausesLabel}
            </h3>
            <p className={`text-sm whitespace-pre-wrap ${isUrdu ? "font-jameel" : "font-sans"}`}>{likelyCausesText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
