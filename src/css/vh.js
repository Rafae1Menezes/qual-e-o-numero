//Código necessário para criar uma variável css --vh com a altura da viewport,
//pois, em smartphones, o atributo vh do css não desconsidera a barra de navegação

// Pegando a altura do viewport e convertendo para 1 unidade
let vh = window.innerHeight * 0.01;
// Criando uma variável --vh no css
document.documentElement.style.setProperty('--vh', `${vh}px`);

// Criando um evento observer qualquer mudança no tamanho da viewport
window.addEventListener('resize', () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});