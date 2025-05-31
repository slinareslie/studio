import TrendingIssuesDisplay from '@/components/ai/trending-issues-display';

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">Análisis de Alertas Ciudadanas</h1>
        <p className="text-lg text-muted-foreground">
          Información generada por IA para entender mejor los problemas reportados en Tacna.
        </p>
      </div>
      
      <TrendingIssuesDisplay />

      {/* Future sections for more detailed AI analysis could go here */}
      {/* For example:
        - Heatmap of alert concentrations
        - Sentiment analysis of comments
        - Predictive trends
      */}
       <div className="mt-12 p-6 bg-secondary/50 rounded-lg border border-dashed">
        <h2 className="font-headline text-2xl mb-3">Próximamente</h2>
        <p className="text-muted-foreground">
          Estamos trabajando en expandir las capacidades de análisis con IA para ofrecerte aún más información valiosa sobre las alertas ciudadanas.
          Algunas ideas incluyen mapas de calor de concentración de alertas, análisis de sentimiento en comentarios y predicción de tendencias futuras.
        </p>
      </div>
    </div>
  );
}
