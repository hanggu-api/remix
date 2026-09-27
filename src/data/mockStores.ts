import { PartnerStore, MaterialItem } from '../types';

export const PARTNER_STORES: PartnerStore[] = [
  {
    id: 'store-1',
    name: 'Elétrica & Iluminação Pinheiros',
    category: 'Material Elétrico & Iluminação',
    address: 'Rua dos Pinheiros, 840 - Pinheiros, SP',
    distanceKm: 0.65,
    etaMinutes: 3,
    rating: 4.9,
    reviewsCount: 428,
    phone: '(11) 3088-4411',
    whatsapp: '5511988776655',
    discountPercent: 10,
    mapPosition: { x: 42, y: 55 },
    isOpenNow: true,
    pickupReadyMinutes: 10
  },
  {
    id: 'store-2',
    name: 'Depósito ConstruFácil Faria Lima',
    category: 'Materiais de Construção & Hidráulica',
    address: 'Av. Brg. Faria Lima, 1600 - Pinheiros, SP',
    distanceKm: 1.1,
    etaMinutes: 5,
    rating: 4.8,
    reviewsCount: 310,
    phone: '(11) 3105-8822',
    whatsapp: '5511977665544',
    discountPercent: 8,
    mapPosition: { x: 68, y: 62 },
    isOpenNow: true,
    pickupReadyMinutes: 15
  },
  {
    id: 'store-3',
    name: 'Garden Center & Ferramentas SP',
    category: 'Jardinagem, Poda & Ferramentas',
    address: 'Rua Teodoro Sampaio, 2100 - Pinheiros, SP',
    distanceKm: 1.6,
    etaMinutes: 7,
    rating: 4.9,
    reviewsCount: 185,
    phone: '(11) 3814-9900',
    whatsapp: '5511966554433',
    discountPercent: 12,
    mapPosition: { x: 28, y: 38 },
    isOpenNow: true,
    pickupReadyMinutes: 12
  },
  {
    id: 'store-4',
    name: 'Tintas & Acabamentos Express',
    category: 'Tintas, Massas & Acessórios',
    address: 'Rua Henrique Schaumann, 450 - Pinheiros, SP',
    distanceKm: 2.3,
    etaMinutes: 9,
    rating: 4.7,
    reviewsCount: 240,
    phone: '(11) 3062-7711',
    whatsapp: '5511955443322',
    discountPercent: 10,
    mapPosition: { x: 75, y: 30 },
    isOpenNow: true,
    pickupReadyMinutes: 20
  }
];

/**
 * Intelligent AI Material Generator:
 * Generates an accurate list of required materials and standard market prices based on request context.
 */
export function generateSmartMaterialsList(category: string, title: string = '', description: string = ''): MaterialItem[] {
  const text = `${title} ${description} ${category}`.toLowerCase();

  if (text.includes('lampada') || text.includes('lâmpada') || text.includes('tomada') || text.includes('eletric') || text.includes('curto') || text.includes('fiação')) {
    return [
      {
        id: 'mat-1',
        name: 'Lâmpada LED Bulbo 12W E27 Branco Frio 6500K',
        quantity: 4,
        unit: 'un',
        unitPrice: 12.0,
        totalPrice: 48.0,
        inStock: true,
        suggestedBrand: 'Philips / Ourolux',
        selected: true
      },
      {
        id: 'mat-2',
        name: 'Fita Isolante Antichamas 19mm x 10m',
        quantity: 1,
        unit: 'rolo',
        unitPrice: 8.5,
        totalPrice: 8.5,
        inStock: true,
        suggestedBrand: '3M Imperial',
        selected: true
      },
      {
        id: 'mat-3',
        name: 'Tomada 10A 2P+T com Placa 4x2 Modular',
        quantity: 1,
        unit: 'conjunto',
        unitPrice: 14.0,
        totalPrice: 14.0,
        inStock: true,
        suggestedBrand: 'Pial Legrand / Tramontina',
        selected: true
      },
      {
        id: 'mat-4',
        name: 'Disjuntor Monopolar 20A Curva C (DIN)',
        quantity: 1,
        unit: 'un',
        unitPrice: 22.0,
        totalPrice: 22.0,
        inStock: true,
        suggestedBrand: 'Schneider / Steck',
        selected: false
      }
    ];
  }

  if (text.includes('grama') || text.includes('jardim') || text.includes('poda') || text.includes('planta')) {
    return [
      {
        id: 'mat-j1',
        name: 'Fio de Nylon para Roçadeira 2.7mm (15m)',
        quantity: 1,
        unit: 'rolo',
        unitPrice: 28.0,
        totalPrice: 28.0,
        inStock: true,
        suggestedBrand: 'Stihl / Tramontina',
        selected: true
      },
      {
        id: 'mat-j2',
        name: 'Saco de Terra Vegetal Adubada 20kg',
        quantity: 2,
        unit: 'saco',
        unitPrice: 24.0,
        totalPrice: 48.0,
        inStock: true,
        suggestedBrand: 'NutriVerde',
        selected: true
      },
      {
        id: 'mat-j3',
        name: 'Fertilizante NPK 10-10-10 Mineral 1kg',
        quantity: 1,
        unit: 'pacote',
        unitPrice: 16.5,
        totalPrice: 16.5,
        inStock: true,
        suggestedBrand: 'Forth Jardim',
        selected: true
      }
    ];
  }

  if (text.includes('vazamento') || text.includes('cano') || text.includes('torneira') || text.includes('encanador') || text.includes('hidraul')) {
    return [
      {
        id: 'mat-h1',
        name: 'Fita Veda Rosca PTFE 18mm x 25m',
        quantity: 1,
        unit: 'rolo',
        unitPrice: 7.0,
        totalPrice: 7.0,
        inStock: true,
        suggestedBrand: 'Tigre / Amanco',
        selected: true
      },
      {
        id: 'mat-h2',
        name: 'Reparo Carrapeta para Registro de Pressão 3/4"',
        quantity: 2,
        unit: 'un',
        unitPrice: 15.0,
        totalPrice: 30.0,
        inStock: true,
        suggestedBrand: 'Deca / Docol',
        selected: true
      },
      {
        id: 'mat-h3',
        name: 'Engate Flexível Trançado Inox 1/2" 40cm',
        quantity: 1,
        unit: 'un',
        unitPrice: 26.0,
        totalPrice: 26.0,
        inStock: true,
        suggestedBrand: 'Censi / Blukit',
        selected: true
      }
    ];
  }

  if (text.includes('pint') || text.includes('tinta') || text.includes('parede') || text.includes('massa')) {
    return [
      {
        id: 'mat-p1',
        name: 'Tinta Látex Acrílica Fosca Branco Neve (Galão 3.6L)',
        quantity: 1,
        unit: 'galão',
        unitPrice: 85.0,
        totalPrice: 85.0,
        inStock: true,
        suggestedBrand: 'Suvinil / Coral',
        selected: true
      },
      {
        id: 'mat-p2',
        name: 'Massa Corrida PVA Balde 5.7kg',
        quantity: 1,
        unit: 'balde',
        unitPrice: 29.9,
        totalPrice: 29.9,
        inStock: true,
        suggestedBrand: 'Suvinil',
        selected: true
      },
      {
        id: 'mat-p3',
        name: 'Fita Crepe Pintura Fácil 24mm x 50m',
        quantity: 2,
        unit: 'rolo',
        unitPrice: 11.5,
        totalPrice: 23.0,
        inStock: true,
        suggestedBrand: '3M',
        selected: true
      },
      {
        id: 'mat-p4',
        name: 'Lixa para Massa Corrida Grão 150',
        quantity: 5,
        unit: 'folha',
        unitPrice: 2.0,
        totalPrice: 10.0,
        inStock: true,
        suggestedBrand: 'Norton',
        selected: true
      }
    ];
  }

  // Generic fallback
  return [
    {
      id: 'mat-g1',
      name: 'Kit de Fixação (Buchas 6mm/8mm e Parafusos Phillips)',
      quantity: 1,
      unit: 'cartela',
      unitPrice: 14.0,
      totalPrice: 14.0,
      inStock: true,
      suggestedBrand: 'Fischer',
      selected: true
    },
    {
      id: 'mat-g2',
      name: 'Fita Multiuso Vedante / Antichamas',
      quantity: 1,
      unit: 'rolo',
      unitPrice: 12.0,
      totalPrice: 12.0,
      inStock: true,
      suggestedBrand: '3M',
      selected: true
    }
  ];
}
