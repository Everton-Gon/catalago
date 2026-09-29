import LegalPage from '@/components/LegalPage'
import { CONTACT, PRODUCTION_TIME, SITE } from '@/config/site'
import { useSeo } from '@/utils/seo'

export default function Terms() {
  useSeo({
    title: 'Termos de uso',
    description: `Condições de uso do site da ${SITE.name} e regras dos pedidos de produtos personalizados.`,
    path: '/termos',
  })

  return (
    <LegalPage
      title="Termos de uso"
      updatedAt="15 de setembro de 2026"
      intro={`Ao usar este site você concorda com as condições abaixo. Elas valem para a navegação, para a montagem da sacola e para os orçamentos solicitados pelo WhatsApp junto à ${SITE.name}.`}
      sections={[
        {
          heading: '1. O site é uma vitrine, não um checkout',
          body: (
            <p>
              Este site exibe produtos e permite montar um pedido, mas{' '}
              <strong>não realiza vendas nem processa pagamentos</strong>. Adicionar itens à
              sacola não gera compra, reserva de estoque nem obrigação de produção. A relação de
              compra e venda só se forma quando o pedido é confirmado por escrito na conversa do
              WhatsApp.
            </p>
          ),
        },
        {
          heading: '2. Preços são estimativas',
          body: (
            <p>
              Todos os valores exibidos são <strong>preços estimados</strong>, apresentados como
              “a partir de”. Produtos personalizados variam conforme quantidade, tamanho,
              modelo, complexidade da arte, material e acabamento. O valor final é sempre
              confirmado no atendimento, antes de qualquer produção.
            </p>
          ),
        },
        {
          heading: '3. Arte e responsabilidade sobre o conteúdo',
          body: (
            <>
              <p>
                Ao enviar uma arte, texto, foto ou logotipo, você declara ter os direitos
                necessários para usá-los. Não produzimos peças com conteúdo que viole direitos
                autorais ou de marca, nem material ofensivo, discriminatório ou ilegal.
              </p>
              <p>
                Erros de digitação em nomes e frases aprovados por você na prova digital são de
                sua responsabilidade — por isso sempre enviamos a prova antes de imprimir.
              </p>
            </>
          ),
        },
        {
          heading: '4. Prazos e entrega',
          body: (
            <p>
              O prazo médio de produção é de {PRODUCTION_TIME}, contado a partir da aprovação da
              arte e não da data do pedido. Prazos e forma de entrega (retirada, entrega local
              ou envio) são combinados caso a caso no atendimento, junto com o valor do frete.
            </p>
          ),
        },
        {
          heading: '5. Trocas e devoluções',
          body: (
            <p>
              Por serem itens feitos sob medida, produtos personalizados não estão sujeitos ao
              direito de arrependimento previsto no art. 49 do Código de Defesa do Consumidor.
              Trocas são feitas em caso de defeito de fabricação ou divergência em relação à
              arte aprovada — fale com a gente em até 7 dias após o recebimento, com fotos do
              item.
            </p>
          ),
        },
        {
          heading: '6. Imagens do catálogo',
          body: (
            <p>
              As imagens são ilustrativas e servem para demonstrar formato e modelo. Pequenas
              variações de cor podem ocorrer entre a tela do seu aparelho e o produto impresso.
            </p>
          ),
        },
        {
          heading: '7. Alterações destes termos',
          body: (
            <p>
              Podemos atualizar estes termos a qualquer momento; a versão vigente é sempre a
              publicada nesta página. Dúvidas: {CONTACT.phoneDisplay} ou {CONTACT.email}.
            </p>
          ),
        },
      ]}
    />
  )
}
