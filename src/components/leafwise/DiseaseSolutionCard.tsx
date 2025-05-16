
import type { SuggestPlantTreatmentOutput } from "@/ai/flows/suggest-treatment-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ShieldPlus, Zap, TestTube2, Info, Package, Factory, Leaf } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DiseaseSolutionCardProps {
  result: SuggestPlantTreatmentOutput;
  language: "en" | "ur";
}

export function DiseaseSolutionCard({ result, language }: DiseaseSolutionCardProps) {
  const isUrdu = language === "ur";

  const cardTitle = isUrdu ? "علاج اور روک تھام" : "Treatment & Prevention";
  const solutionsLabel = isUrdu ? "تجویز کردہ حل:" : "Suggested Solutions:";
  const preventionLabel = isUrdu ? "احتیاطی تدابیر:" : "Preventative Measures:";
  
  const chemicalTreatmentsSectionTitle = isUrdu ? "کیمیائی علاج" : "Chemical Treatments";
  const chemicalNameHeader = isUrdu ? "کیمیائی نام" : "Chemical Name";
  const instructionsHeader = isUrdu ? "مقدار/ہدایات" : "Quantity/Instructions";
  const exampleProductsHeader = isUrdu ? "مثالی مصنوعات (پاکستان)" : "Example Products (Pakistan)"; // English for now, AI provides English
  const brandNameLabel = "Brand";
  const manufacturerLabel = "Manufacturer";
  const cropUsageLabel = "Crops";


  const additionalNotesTitle = isUrdu ? "اضافی نوٹس" : "Additional Notes";
  
  const solutionsText = isUrdu ? (result.suggestedSolutionsUrdu || result.suggestedSolutions) : result.suggestedSolutions;
  const preventionText = isUrdu ? (result.preventativeMeasuresUrdu || result.preventativeMeasures) : result.preventativeMeasures;

  const hasChemicalTreatments = result.chemicalTreatments && result.chemicalTreatments.length > 0;
  const hasAdditionalNotes = result.additionalNotes && result.additionalNotes.trim().length > 0;

  return (
    <Card className="shadow-lg">
      <CardHeader dir={isUrdu ? "rtl" : "ltr"}>
        <CardTitle className={`text-xl flex items-center ${isUrdu ? "font-jameel justify-end flex-row-reverse" : "font-sans"}`}>
          <Lightbulb className={`${isUrdu ? "ml-2" : "mr-2"} text-primary`} />
          {cardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-6 ${isUrdu ? "font-jameel text-right" : "font-sans"}`} dir={isUrdu ? "rtl" : "ltr"}>
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

        {hasChemicalTreatments && (
          <div>
            <h3 className={`font-semibold text-primary flex items-center mb-2 ${isUrdu ? "font-jameel justify-end flex-row-reverse" : "font-sans"}`}>
              <TestTube2 className={`h-5 w-5 ${isUrdu ? "ml-2" : "mr-2"}`} />
              {chemicalTreatmentsSectionTitle}
            </h3>
            <div className="rounded-md border overflow-hidden">
              <Table className={`${isUrdu ? "font-jameel" : "font-sans"}`}>
                <TableHeader>
                  <TableRow>
                    <TableHead className={`w-[25%] font-semibold ${isUrdu ? "text-right" : "text-left"}`}>{chemicalNameHeader}</TableHead>
                    <TableHead className={`w-[40%] font-semibold ${isUrdu ? "text-right" : "text-left"}`}>{instructionsHeader}</TableHead>
                    {language === 'en' && <TableHead className={`w-[35%] font-semibold ${isUrdu ? "text-right" : "text-left"}`}>{exampleProductsHeader}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.chemicalTreatments?.map((treatment, index) => (
                    <TableRow key={index}>
                      <TableCell className={`font-medium ${isUrdu ? "text-right" : "text-left"}`}>
                        {isUrdu ? (treatment.chemicalNameUrdu || treatment.chemicalName) : treatment.chemicalName}
                      </TableCell>
                      <TableCell className={`whitespace-pre-wrap ${isUrdu ? "text-right" : "text-left"}`}>
                        {isUrdu ? (treatment.instructionsUrdu || treatment.instructions) : treatment.instructions}
                      </TableCell>
                      {language === 'en' && (
                        <TableCell className={`text-left`}>
                          {treatment.productsInPakistan && treatment.productsInPakistan.length > 0 ? (
                            <ul className="space-y-2">
                              {treatment.productsInPakistan.map((product, prodIndex) => (
                                <li key={prodIndex} className="text-xs border-b border-border/50 pb-1 last:border-b-0 last:pb-0">
                                  <div className="flex items-center font-semibold">
                                    <Package size={14} className="mr-1 text-primary/80"/> {product.brandName}
                                  </div>
                                  {product.manufacturer && (
                                    <div className="flex items-center text-muted-foreground">
                                      <Factory size={12} className="mr-1"/> {manufacturerLabel}: {product.manufacturer}
                                    </div>
                                  )}
                                  {product.cropUsage && (
                                     <div className="flex items-center text-muted-foreground">
                                      <Leaf size={12} className="mr-1"/> {cropUsageLabel}: {product.cropUsage}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No specific product examples provided.</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* General Disclaimer, always shown if chemical treatments are present */}
            <p className="text-xs text-muted-foreground mt-2 font-sans text-left"> 
              Disclaimer: Chemical treatments and product examples are for informational purposes only, based on general AI knowledge, and may not be exhaustive or current. Always verify local availability, suitability according to product labels, and follow local regulations and safety precautions. Consult with a local agricultural extension office or professional for advice specific to your situation.
            </p>
          </div>
        )}

        {hasAdditionalNotes && language === 'en' && (
           <div>
            <h3 className={`font-semibold text-primary flex items-center mb-2 font-sans`}>
              <Info className={`h-5 w-5 mr-2`} />
              {additionalNotesTitle}
            </h3>
            <p className={`text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md font-sans`}>{result.additionalNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
