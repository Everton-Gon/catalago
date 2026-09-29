import type { Product } from '@/types'
import { MUG_PRODUCTS } from './mugs'
import { SHIRT_PRODUCTS } from './shirts'

/**
 * Catálogo inicial.
 *
 * Para adicionar um produto basta copiar um bloco e ajustar os campos —
 * `id` e `slug` precisam ser únicos. As imagens ficam em `public/produtos/`.
 */

export const PRODUCTS: Product[] = [
  // ---------------------------------------------------------------- CANECAS
  ...MUG_PRODUCTS,

  // -------------------------------------------------------------- CAMISETAS
  ...SHIRT_PRODUCTS,

  // ------------------------------------------------------------------ COPOS
  {
    id: 'copo-personalizado',
    name: 'Copo Personalizado',
    slug: 'copo-personalizado',
    shortDescription: 'Copo acrílico resistente para festas, brindes e uso diário.',
    description:
      'Copo em acrílico resistente com impressão colorida em toda a volta. Excelente custo-benefício para festas, lembrancinhas e brindes corporativos em grande quantidade.',
    category: 'copos',
    images: ['/produtos/copo-1.svg', '/produtos/copo-2.svg'],
    price: 30,
    featured: true,
    available: true,
    salesRank: 75,
    variants: [
      {
        id: 'modelo',
        name: 'Modelo',
        required: true,
        options: [
          { label: 'Long drink 350 ml' },
          { label: 'Twister 300 ml', priceDelta: 2 },
          { label: 'Caldereta 350 ml', priceDelta: 4 },
        ],
      },
      {
        id: 'acabamento',
        name: 'Acabamento',
        required: true,
        options: [{ label: 'Transparente' }, { label: 'Fosco', priceDelta: 3 }],
      },
    ],
    personalization: {
      enabled: true,
      nameField: { label: 'Nome para personalização', placeholder: 'Ex.: Casamento M&J', maxLength: 40 },
      textField: { label: 'Frase ou texto', placeholder: 'Ex.: 15 anos da Beatriz', maxLength: 160 },
    },
    createdAt: '2026-01-20',
  },
  {
    id: 'copo-com-tampa',
    name: 'Copo com Tampa Personalizado',
    slug: 'copo-com-tampa-personalizado',
    shortDescription: 'Copo térmico com tampa e canudo, pronto para levar pra qualquer lugar.',
    description:
      'Copo com tampa rosqueável e canudo, em parede dupla que conserva a temperatura. Personalização colorida em toda a volta. Ideal para academia, trabalho e presentes.',
    category: 'copos',
    images: ['/produtos/copo-tampa-1.svg', '/produtos/copo-tampa-2.svg'],
    price: 35,
    featured: false,
    available: true,
    salesRank: 65,
    variants: [
      {
        id: 'capacidade',
        name: 'Capacidade',
        required: true,
        options: [{ label: '500 ml' }, { label: '700 ml', priceDelta: 8 }],
      },
      {
        id: 'cor-tampa',
        name: 'Cor da tampa',
        required: true,
        options: [
          { label: 'Preta', swatch: '#1c1917' },
          { label: 'Branca', swatch: '#f5f5f4' },
          { label: 'Rosa', swatch: '#db2777' },
          { label: 'Azul', swatch: '#2563eb' },
        ],
      },
    ],
    personalization: {
      enabled: true,
      nameField: { label: 'Nome para personalização', placeholder: 'Ex.: Camila', maxLength: 40 },
      textField: { label: 'Frase ou texto', placeholder: 'Ex.: Foco, força e fé', maxLength: 160 },
    },
    createdAt: '2026-02-18',
  },
  {
    id: 'squeeze-aluminio',
    name: 'Squeeze de Alumínio Personalizado',
    slug: 'squeeze-de-aluminio-personalizado',
    shortDescription: 'Garrafa leve de alumínio com impressão total e tampa de rosca.',
    description:
      'Squeeze de alumínio com pintura branca para sublimação, tampa de rosca e mosquetão. A impressão cobre a garrafa inteira, permitindo artes fotográficas.',
    category: 'copos',
    images: ['/produtos/squeeze-1.svg', '/produtos/squeeze-2.svg'],
    price: 38,
    featured: false,
    available: true,
    salesRank: 45,
    variants: [
      {
        id: 'capacidade',
        name: 'Capacidade',
        required: true,
        options: [{ label: '500 ml' }, { label: '750 ml', priceDelta: 7 }],
      },
    ],
    personalization: {
      enabled: true,
      nameField: { label: 'Nome para personalização', placeholder: 'Ex.: Rafael', maxLength: 40 },
      textField: { label: 'Frase ou texto', placeholder: 'Ex.: Corrida São Silvestre', maxLength: 160 },
    },
    createdAt: '2026-03-08',
  },

  // ------------------------------------------------------------------- KITS
  {
    id: 'kit-presente',
    name: 'Kit Presente Personalizado',
    slug: 'kit-presente-personalizado',
    shortDescription: 'Combinação pronta para presentear, com embalagem especial.',
    description:
      'Kit montado e embalado para presente, com todos os itens personalizados com a mesma arte. Escolha a composição e a embalagem — incluímos cartão com mensagem sem custo adicional.',
    category: 'kits',
    images: ['/produtos/kit-1.svg', '/produtos/kit-2.svg'],
    price: 60,
    featured: true,
    available: true,
    badge: 'Presente pronto',
    salesRank: 90,
    variants: [
      {
        id: 'composicao',
        name: 'Composição',
        required: true,
        options: [
          { label: 'Caneca + caixa + cartão' },
          { label: 'Caneca + copo + chaveiro', priceDelta: 25 },
          { label: 'Caneca + camiseta', priceDelta: 40 },
        ],
      },
      {
        id: 'embalagem',
        name: 'Embalagem',
        required: true,
        options: [
          { label: 'Caixa kraft' },
          { label: 'Caixa rígida com laço', priceDelta: 12 },
        ],
      },
    ],
    personalization: {
      enabled: true,
      nameField: { label: 'Nome do presenteado', placeholder: 'Ex.: Tia Regina', maxLength: 40 },
      textField: {
        label: 'Mensagem do cartão',
        placeholder: 'Ex.: Que este ano seja repleto de conquistas!',
        maxLength: 200,
      },
    },
    createdAt: '2026-02-25',
  },

  // ---------------------------------------------------------------- QUADROS
  {
    id: 'quadro-personalizado',
    name: 'Quadro Personalizado',
    slug: 'quadro-personalizado',
    shortDescription: 'Sua foto ou frase favorita impressa e emoldurada, pronta para pendurar.',
    description:
      'Quadro decorativo com impressão em alta resolução, moldura em MDF e acabamento pronto para pendurar. Perfeito para fotos de família, versículos e frases motivacionais.',
    category: 'quadros',
    images: ['/produtos/quadro-1.svg', '/produtos/quadro-2.svg'],
    price: 55,
    featured: false,
    available: true,
    salesRank: 50,
    variants: [
      {
        id: 'tamanho',
        name: 'Tamanho',
        required: true,
        options: [
          { label: '20 x 30 cm' },
          { label: '30 x 40 cm', priceDelta: 20 },
          { label: '40 x 60 cm', priceDelta: 45 },
        ],
      },
      {
        id: 'moldura',
        name: 'Moldura',
        required: true,
        options: [
          { label: 'Preta', swatch: '#1c1917' },
          { label: 'Branca', swatch: '#f5f5f4' },
          { label: 'Madeira', swatch: '#b45309', priceDelta: 8 },
        ],
      },
    ],
    personalization: {
      enabled: true,
      textField: {
        label: 'Frase ou texto do quadro',
        placeholder: 'Ex.: Lar, doce lar',
        maxLength: 200,
      },
    },
    createdAt: '2026-03-12',
  },

  // -------------------------------------------------------- PERSONALIZADOS
  {
    id: 'almofada-personalizada',
    name: 'Almofada Personalizada',
    slug: 'almofada-personalizada',
    shortDescription: 'Capa em tecido macio com estampa dos dois lados, se quiser.',
    description:
      'Almofada com capa em tecido próprio para sublimação, com zíper invisível. Pode ser estampada frente e verso. Escolha se prefere apenas a capa ou o conjunto com enchimento.',
    category: 'personalizados',
    images: ['/produtos/almofada-1.svg', '/produtos/almofada-2.svg'],
    price: 45,
    featured: false,
    available: true,
    salesRank: 40,
    variants: [
      {
        id: 'tamanho',
        name: 'Tamanho',
        required: true,
        options: [{ label: '30 x 30 cm' }, { label: '40 x 40 cm', priceDelta: 10 }],
      },
      {
        id: 'tipo',
        name: 'Tipo',
        required: true,
        options: [
          { label: 'Com enchimento' },
          { label: 'Somente a capa', priceDelta: -8 },
        ],
      },
    ],
    personalization: {
      enabled: true,
      nameField: { label: 'Nome para personalização', placeholder: 'Ex.: Família Souza', maxLength: 40 },
      textField: { label: 'Frase ou texto', placeholder: 'Ex.: Nosso cantinho', maxLength: 160 },
    },
    createdAt: '2026-03-20',
  },
]





