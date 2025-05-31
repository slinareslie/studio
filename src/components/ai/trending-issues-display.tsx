'use client';

import { useEffect, useState } from 'react';
import { analyzeTrendingIssues } from '@/ai/flows/analyze-trending-issues';
import type { AnalyzeTrendingIssuesOutput } from '@/ai/flows/analyze-trending-issues';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Bot, AlertTriangle, Tags } from 'lucide-react';

export default function TrendingIssuesDisplay() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTrendingIssuesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await analyzeTrendingIssues({});
        setAnalysisResult(result);
      } catch (e: any) {
        console.error("Error fetching AI analysis:", e);
        setError(e.message || "No se pudo obtener el análisis de tendencias.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalysis();
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" /> Análisis de Tendencias por IA
        </CardTitle>
        <CardDescription>
          Palabras clave principales identificadas por IA en las alertas recientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="h-8 w-8" />
            <p className="ml-3 text-muted-foreground">Analizando datos...</p>
          </div>
        )}
        {error && (
          <div className="text-destructive flex items-center py-4">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        {analysisResult && analysisResult.topKeywords && analysisResult.topKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Tags className="h-5 w-5 text-muted-foreground mr-1 mt-1" />
            {analysisResult.topKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-accent/30 text-accent-foreground/80">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
        {analysisResult && (!analysisResult.topKeywords || analysisResult.topKeywords.length === 0) && !isLoading && !error && (
          <p className="text-muted-foreground">No hay suficientes datos para mostrar tendencias por IA en este momento.</p>
        )}
      </CardContent>
    </Card>
  );
}
