import { digitsOnly, formatBRL, formatKwh } from "./format";

export const COMPANY_WHATSAPP = "5515991798612"; // (15) 99179-8612
export const COMPANY_INSTAGRAM = "https://instagram.com/sunny_energia";

export function buildWhatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(message)}`;
}

export function defaultWhatsappUrl(): string {
  return buildWhatsappUrl(
    COMPANY_WHATSAPP,
    "Olá! Gostaria de saber mais sobre energia solar."
  );
}

export function simulationWhatsappMessage(params: {
  valorConta: number;
  consumoKwh: number;
  modulos: number;
  economiaMensal: number;
}): string {
  return [
    "Olá! Fiz uma simulação:",
    "",
    `Conta: ${formatBRL(params.valorConta)}`,
    `Consumo: ${formatKwh(params.consumoKwh)}`,
    `Módulos: ${params.modulos}`,
    `Economia: ${formatBRL(params.economiaMensal)}`,
    "",
    "Gostaria de um orçamento completo.",
  ].join("\n");
}

export function leadWhatsappUrl(leadPhone: string, leadName: string): string {
  const msg = `Olá ${leadName.split(" ")[0]}, aqui é da Grupo Sunny Energia! Vi sua simulação no nosso site e quero te ajudar a montar o melhor orçamento de energia solar.`;
  return buildWhatsappUrl(leadPhone, msg);
}