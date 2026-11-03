# DNAVE — landing page de lançamento

HTML, CSS e JS sem build. Abra `index.html` direto no navegador (duplo clique) ou publique a pasta inteira em qualquer hospedagem estática.

## Modo revisão

Acrescente `?revisao` ou `#revisao` ao endereço (ex.: `index.html?revisao`; no link do Artifact, só `#revisao` funciona). Cada bloco que o cliente precisa confirmar ganha um contorno tracejado com o motivo. Sem o parâmetro, a página fica limpa.

## Quando o cliente confirmar

| O quê | Onde mexer |
| --- | --- |
| Links da App Store e do Google Play | `index.html`, os dois `<a class="loja" href="#">`: trocar `#` pelo link |
| Link de cadastro de motoristas | `index.html`, seção `#motorista`, botão "Quero dirigir com a DNAVE" |
| Texto da DNAVE Rainbow | `index.html`, cartão `.categoria--rainbow` |
| Imagem de compartilhamento | `index.html`, `og:image`: usar a URL completa do domínio |
| Liberar o Google (no dia do lançamento) | `index.html`, apagar a linha `<meta name="robots" content="noindex, nofollow">` |

Link com `href="#"` e `data-pendente` mostra um aviso em vez de abrir. Basta trocar o `href` que ele volta a ser um link normal.

## Arquivos

- `assets/video/`: vídeo de lançamento em 16:9 (desktop e tablet) e 9:16 (celular até 767 px), recomprimidos para a web a partir de `video-dnave/out/`. A legenda `.vtt` veio do `.srt`.
- `assets/js/legenda.js`: as mesmas falas da legenda. Quando a página abre direto do disco (`file://`), o navegador bloqueia o `.vtt`, e a legenda entra por esse arquivo.
- `assets/logo/`: logo em SVG gerado de `video-dnave/src/brand/logoPaths.ts`.
- `assets/img/`: fotos de `video-dnave/public/img` e um quadro de `public/video/accessible_car.mp4`, reduzidas.

## Acessibilidade

- Contraste WCAG AA conferido em todas as combinações de texto. O âmbar `#E99E09` só aparece como texto sobre o grafite. Sobre fundo claro, o texto em âmbar usa `#8A5A00`.
- Link "Pular para o conteúdo", foco visível, menu do celular com `aria-expanded` e fechamento pelo Esc.
- O vídeo começa sem som e com legenda. O botão "Assistir com som" recomeça o vídeo do início. Com "reduzir movimento" ligado no sistema, o vídeo não toca sozinho. A transcrição completa fica abaixo do vídeo.
