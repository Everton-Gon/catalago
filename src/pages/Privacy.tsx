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
      updatedAt="15 de setembro de 2026"
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
                “Solicitar orçamento pelo WhatsApp”. Você pode apagá-los a qualquer momento
                esvaziando a sacola ou limpando os dados do site no navegador.
              </p>
            </>
          ),
        },
        {
          heading: '3. Arquivos de arte',
          body: (
            <p>
              Quando você seleciona um arquivo de arte na página do produto, ele{' '}
              <strong>não é enviado para nenhum servidor</strong>. O arquivo fica apenas na
              memória da aba aberta, para gerar a prévia, e desaparece quando você fecha ou
              recarrega a página. O envio real da arte acontece quando você anexa o arquivo na
              conversa do WhatsApp.
            </p>
          ),
        },
        {
          heading: '4. O que acontece ao enviar o pedido',
          body: (
            <p>
              Ao clicar no botão de orçamento, abrimos o WhatsApp com uma mensagem já escrita
              contendo os itens da sua sacola. A partir daí a conversa passa a ser regida pelos
              termos e pela política de privacidade do próprio WhatsApp. Os dados que você nos
              enviar por lá (nome, endereço de entrega, arte) são usados exclusivamente para
              produzir e entregar o seu pedido.
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
