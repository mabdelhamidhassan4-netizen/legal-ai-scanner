import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, fileName } = location.state || {};

  // Redirect if no data
  if (!formData) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 hover:bg-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scan Page
          </Button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Analysis Results
            </h1>
            <p className="text-muted-foreground">
              Document: <span className="font-medium text-foreground">{fileName}</span>
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-6">
          {/* Document Summary */}
          <Card className="border-2">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Document Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Name</p>
                  <p className="text-base">{formData.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Email</p>
                  <p className="text-base">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Document Type</p>
                  <p className="text-base capitalize">{formData.documentType}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Analysis Date</p>
                  <p className="text-base">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground italic">
                  📌 API Integration: This section will display metadata extracted from AWS Textract
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Text */}
          <Card className="border-2">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Extracted Text Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-muted p-6 rounded-lg min-h-[200px] font-mono text-sm">
                <p className="text-muted-foreground mb-4">
                  [Extracted text will appear here from AWS Textract]
                </p>
                <p className="text-muted-foreground">
                  This area will display the full OCR-extracted content from the uploaded document...
                </p>
              </div>
              <div className="mt-4 p-4 bg-accent/10 border border-accent rounded-lg">
                <p className="text-sm text-foreground">
                  💡 <strong>Integration Note:</strong> Connect to AWS Textract API to populate extracted text data here.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Suspicious Areas / Forgery Indicators */}
          <Card className="border-2 border-destructive/20">
            <CardHeader className="bg-destructive/5">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Suspicious Areas / Forgery Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="font-semibold text-destructive mb-2">Indicator 1</p>
                  <p className="text-sm text-muted-foreground">
                    [Description of suspicious pattern detected by AI]
                  </p>
                </div>
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="font-semibold text-destructive mb-2">Indicator 2</p>
                  <p className="text-sm text-muted-foreground">
                    [Description of anomaly or inconsistency found]
                  </p>
                </div>
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="font-semibold text-destructive mb-2">Indicator 3</p>
                  <p className="text-sm text-muted-foreground">
                    [Additional suspicious findings from AWS Comprehend analysis]
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-accent/10 border border-accent rounded-lg">
                <p className="text-sm text-foreground">
                  💡 <strong>Integration Note:</strong> This section will display an array of forgery indicators identified by AWS Comprehend's sentiment and entity analysis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Final AI Decision */}
          <Card className="border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                Final AI Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="inline-block p-6 bg-muted rounded-full mb-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Awaiting Analysis</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  The final verdict will be displayed here after AWS Textract and Comprehend complete their analysis. 
                  This will indicate whether the document is genuine or potentially forged.
                </p>
                <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-lg max-w-2xl mx-auto">
                  <p className="text-sm">
                    <strong>Expected Output:</strong> JSON response containing confidence score, risk level, 
                    and detailed reasoning from the AI models.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/")}
            className="text-base"
          >
            Scan Another Document
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
