/**
 * Marka listesini kategoriye gore gruplar.
 *
 * Backend, kategori verildiginde listeyi KISALTMIYOR: tum markalari
 * donduruyor, her birine `oncelikli` bayragi koyuyor ve siralamayi
 * yakinliga gore yapiyor. Bu yuzden burada yapilacak is yalnizca gorsel
 * gruplama.
 *
 * Marka gizlemiyoruz: esleme yanlissa satici markasini bulamaz ve ilan
 * veremez - sessiz bir kayip. Onceliklendirmede yanlis eslemenin bedeli
 * fazladan bir kaydirma.
 */

export interface Marka {
  id: string;
  name: string;
  oncelikli?: boolean;
}

export interface MarkaGruplari {
  /** Bu kategoride yaygin olanlar. Kategori secilmemisse bos. */
  oneCikan: Marka[];
  /** Geri kalanlar. Kategori secilmemisse TUM liste buraya duser. */
  digerleri: Marka[];
}

export function markalariGrupla(markalar: Marka[] | undefined): MarkaGruplari {
  const liste = markalar ?? [];
  // Hic bayrak yoksa (kategori secilmemis) tek liste: yapay bir "yaygin"
  // basligi gostermek yaniltici olurdu.
  if (!liste.some((m) => m.oncelikli)) return { oneCikan: [], digerleri: liste };
  return {
    oneCikan: liste.filter((m) => m.oncelikli),
    digerleri: liste.filter((m) => !m.oncelikli),
  };
}
