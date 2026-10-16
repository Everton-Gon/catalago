import LegalPage from '@/components/LegalPage'
import { CONTACT, SITE } from '@/config/site'
import { useSeo } from '@/utils/seo'

export default function Privacy() {
  useSeo({
    title: 'Política de privacidade',
    description: `Como a ${SITE.name} trata os dados de quem navega e faz pedidos pelo site.`,
    path: '/politica-de-privacidade',
  })

  return (
    <LegalPage
      title="Política de privacidade"
      updatedAt="16 de outubro de 2026"
      intro={`Esta página explica, de forma direta, quais dados a ${SITE.name} coleta quando você usa este site e o que fazemos com eles. Se algo não estiver claro, fale com a gente.`}
      sections={[
        {
          heading: '1. Não há cadastro neste site',
          body: (
            <p>
              O site não possui login, cadastro de clientes, senha nem área do cliente. Você
              navega e monta seu pedido como visitante. Não pedimos CPF, endereço, dados
              bancários ou de cartão em nenhuma tela.
            </p>
          ),
        },
        {
          heading: '2. Dados guardados no seu navegador',
          body: (
            <>
              <p>
                Os itens da sua sacola ficam salvos no <strong>localStorage</strong> do seu
                próprio navegador — no seu aparelho, não nos nossos servidores. Guardamos ali:
                produto escolhido, variações, quantidade, textos de personalização e
                observações.
              </p>
              <p>
                Esses dados não são enviados para lugar nenhum enquanto você não clicar em
                “Registrar orçamento”. Você pode apagá-los a qualquer momento
                esvaziando a sacola ou limpando os dados do site no navegador.
              </p>
            </>
          ),
        },
        {
          heading: '3. Arquivos de arte',
          body: (
            <p>
              A foto ou arte escolhida fica guardada no armazenamento local do navegador (IndexedDB),
              vinculada ao item da sacola. Ao registrar o orçamento, enviamos o arquivo para
              armazenamento privado na Cloudflare R2 e guardamos a referência no orçamento administrativo.
              A imagem não entra no catálogo público. O link protegido incluído na mensagem permite
              consultar o arquivo; qualquer pessoa que receber esse link poderá abri-lo.
              Para apagar os arquivos locais, limpe os dados deste site no navegador.
            </p>
          ),
        },
        {
          heading: '4. O que acontece ao enviar o pedido',
          body: (
            <p>
              Ao registrar o orçamento, salvamos seu nome, WhatsApp, produtos, opções, textos,
              observações e referências dos arquivos para atender sua solicitação. Só confirmamos
              o registro após a gravação. Depois você pode abrir o WhatsApp com o número do orçamento,
              os detalhes e links das imagens, e tocar em Enviar. O arquivo não é anexado como foto
              automaticamente. A conversa passa a seguir também os termos e a política do WhatsApp.
              O registro não confirma venda, pagamento, prazo ou entrega.
            </p>
          ),
        },
        {
          heading: '5. Cookies e medição de audiência',
          body: (
            <p>
              Nesta versão o site não utiliza cookies de rastreamento nem ferramentas de
              analytics de terceiros. Caso isso mude, atualizaremos esta página e informaremos
              de forma visível antes da ativação.
            </p>
          ),
        },
        {
          heading: '6. Seus direitos',
          body: (
            <p>
              Conforme a Lei Geral de Proteção de Dados (LGPD), você pode pedir a confirmação,
              a correção ou a exclusão dos dados que tivermos sobre você, além de revogar
              consentimentos. Para isso, escreva para{' '}
              <a
                href={`mailto:${CONTACT.email}`}
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                {CONTACT.email}
              </a>
              .
            </p>
          ),
        },
        {
          heading: '7. Contato',
          body: (
            <p>
              Dúvidas sobre esta política? Fale com a {SITE.name} pelo WhatsApp{' '}
              {CONTACT.phoneDisplay} ou pelo e-mail {CONTACT.email}.
            </p>
          ),
        },
      ]}
    />
  )
}
