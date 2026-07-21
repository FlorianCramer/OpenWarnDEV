"use client";

import { Button, Card } from "flowbite-react";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-700">
      <Card className="max-w-sm">
        <h1 className="text-2xl font-bold text-white">Flowbite funktioniert 🎉</h1>
        <Button>Button</Button>
      </Card>
    </main>
  );
}