"use client";
import { useState } from "react";
import { Header } from "@/components/header";
import { MainLayout } from "@/components/main-layout";
import { ApiKeyDialog } from "@/components/api-key-dialog";

export default function Home() {
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  return (
    <>
      <Header onOpenKeyDialog={() => setKeyDialogOpen(true)} />
      <MainLayout onOpenKeyDialog={() => setKeyDialogOpen(true)} />
      <ApiKeyDialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen} />
    </>
  );
}
