export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Avisa. Todos los derechos reservados.</p>
        <p className="mt-1">Una iniciativa para mejorar nuestra ciudad.</p>
      </div>
    </footer>
  );
}
