/**
* Classe Game faz uma requisição via http para receber um json com um número aleatório dentro de um intervalo de números.
* Esse número secreto é armazenado
* O jogador tenta acertar esse número com um palpite
* O programa analisa se o palpite é maior ou menor que o número secreto
* O jogo cria uma um display em formato de leds com 7 segmentos em formato SVG
* Para estilizar a aplicação, o programa insere e retira as seguintes classes css: 'success', 'error', 'disabled', 'active'
* @class Game
*/

export default class Game {
    constructor(data) {
        this.inicialNumber = data.inicialNumber
        this.min = data.range.min
        this.max = data.range.max
        this.guess = data.guessInput
        this.number = data.numberField
        this.mensage = data.mensageField
        this.sendButton = data.sendButton
        this.newGameButton = data.newGameButton
    }

    /** 
    *   @method start()
    *   Armazena um número secreto
    *   Cria os eventos do DOM
    *   Inicia o display com um número inicial
    */

    start(){        
        this.secretNumber = this.getSecretNumber(this.min, this.max)
        this.createEvents()
        this.showNumberOnDisplay(this.inicialNumber)
        this.guess.focus()
    }

    /**
    *   @method createEvents
    *   Cria um evento de click para realizar o palpite
    *   Cria um evento de click para Nova Partida
    *   Cria um evento onkeydown para permitir que apenas números sejam digitados
    *   Cria um evento onkeyup para remover pontos e traços
    */

    createEvents() {
        this.sendButton.onclick = () => this.guessNumber()
        this.newGameButton.onclick = () => this.reset()
        this.guess.onkeydown = (e) => { this.onlyNumberInter(e) }
        this.guess.onkeyup = () => { this.removeDotDash() }
    }

    /**
    *   Esse método faz uma requisição http com um intervalo mínimo e máximo.
    *   Caso a requisição retorne um erro ou ocorra um erro na requisição, o método mostra a mensagem de erro e o statusCode no display.
    *   @method  getSecretNumber()
    *   @param {Number} min menor número do intervalo
    *   @param {Number} max maior número do intervalo
    */

    async getSecretNumber(min, max) {
        return await fetch(`https://us-central1-ss-devops.cloudfunctions.net/rand?min=${min}&max=${max}`)
            .then(response => response)
            .then(data => data.json())
            .then(num => {
                if (!!num.Error) {
                    this.showMensage(num.Error, "error")
                    this.showNumberOnDisplay(num.StatusCode)
                    this.disableForm()
                    this.showNewGameButton()
                    return false
                }
                this.secretNumber = num.value
            })
            .catch(e => {
                this.showMensage("Aconteceu um erro, tente novamente.", "error")
                this.showNumberOnDisplay(404)
                this.disableForm()
                this.showNewGameButton()
                return false
            })
    }

    /**
    *   Insere uma mensagem no campo de mensagem
    *   Estiliza o campo e o número com classes css
    *   @method showMensage       
    *   @param {String} msg mesagem a ser mostrada
    *   @param {String} type sucess | error | undefined
    */

    showMensage(msg, type) {
        this.mensage.innerText = msg

        if (type == 'success') {
            this.number.classList.add('success')
            this.mensage.classList.add('success')
        } else if (type == 'error') {
            this.number.classList.add('error')
            this.mensage.classList.add('error')
        }
    }

    /**
    *   Verifica se o palpite é válido
    *   Mostra o palpite no display
    *   Verifica se o palpite é igual, maior ou menor que o número secreto
    *   @method guessNumber
    */

    guessNumber() {
        if (!this.isFormValid()) {
            this.emptyGuess()
            return false
        }

        this.showNumberOnDisplay(this.guess.value)

        if (this.secretNumber == this.guess.value) {
            this.showMensage("Você acertou", "success")
            this.showNewGameButton()
            this.disableForm()
        }
        else if (this.secretNumber > this.guess.value) this.showMensage('É maior')
        else this.showMensage('É menor')

        this.emptyGuess()
    }

    /**
    *   Reseta o formulário de palpite
    *   @method emptyGuess
    */

    emptyGuess(){
        this.guess.value = ''
        this.guess.focus()
    }

    /**
    *   Mostra na tela o botão de tentar novamente
    *   @method showNewGameButton
    */

    showNewGameButton() {
        this.newGameButton.style.visibility = 'visible'
    }

    /**
    *   Valida se o palpite está vazio ou se não é um número
    *   @method isFormValid
    */

    isFormValid() {
        if (this.guess.value === "") return false
        if (isNaN(Number(this.guess.value)))  return false

        return true
    }

    /**
    *   Desabilita o formulário de palpite (input e botão)
    *   @method disableForm
    */

    disableForm() {
        this.sendButton.classList.add('disabled')
        this.guess.disabled = true;
    }

    /**
    *   Insere na DOM o SVG gerado para o display
    *   @method showNumberOnDisplay
    *   @param {string} num Número a ser gerado
    */

    showNumberOnDisplay(num) {
        this.number.innerHTML = this.criaNumberSVG(Number(num))
    }

    /**
    *   Reinicia o jogo esvaziando os campos e removendo das casses de css
    *   Armazena um novo número secreto
    *   @method reset
    */

    reset() {
        this.number.innerHTML = this.criaNumberSVG(this.inicialNumber)
        this.mensage.innerText = ''
        this.guess.value = ''
        this.guess.disabled = false;
        this.secretNumber = this.getSecretNumber(this.min, this.max)
        this.guess.focus()

        this.number.classList.remove('success')
        this.number.classList.remove('error')
        this.mensage.classList.remove('success')
        this.mensage.classList.remove('error')
        this.sendButton.classList.remove('disabled')
        this.newGameButton.style.visibility = 'hidden'
    }

    /**
    *   Cria números em SVG   
    *   separa os caracteres do número em vetor
    *   para cada posição do vetor, cria tags de SVG, e insere a classe 'active' para os leds que devem acender
    *   retorna o svg
    * 
    *   1 path - led superior
    *   2 path - led superior direito
    *   3 path - led inferior direito
    *   4 path - led inferior
    *   5 path - led inferior esquerdo
    *   6 path - led superior esquerdo
    *   7 path - led do meio
    * 
    *   @method criaNumberSVG
    *   @param {number} num número que será mosrado no display
    */

    criaNumberSVG(number) {
        const vetorCaracter = String(number).split('')
        return vetorCaracter.reduce((acc, n) => {
            return acc + `
            <svg width="248"  viewBox="0 0 56 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.9486 10.9918H42.7824L53.1041 1.18995C52.1487 0.451498 50.9534 0.00890446 49.6541 0.00890446H5.81579C4.52429 0.00890446 3.33852 0.445189 2.38627 1.17338L12.9486 10.9918Z" fill="blue" 
                class="${(n == 0 || n == 2 || n == 3 || n == 5 || n == 6 || n == 7 || n == 8 || n == 9) ? 'active' : ''}"></path> <!-- 1 -->
                <path d="M43.3693 12.1889V42.7051L52.0129 49.1831C53.8456 48.2475 55.1024 46.3461 55.1024 44.1473V5.78905C55.1024 4.44312 54.6306 3.21001 53.8472 2.23961L43.3693 12.1889Z" 
                class="${(n == 0 || n == 1 || n == 2 || n == 3 || n == 4 || n == 7 || n == 8 || n == 9) ? 'active' : ''}"></path> <!-- 2 -->
                <path d="M43.5768 87.9434V57.4272L52.2205 50.9492C54.0532 51.8857 55.3099 53.7862 55.3099 55.985V94.3433C55.3099 95.6884 54.8382 96.9216 54.0547 97.8935L43.5768 87.9434Z" 
                class="${(n == 0 || n == 1 || n == 3 || n == 4 || n == 5 || n == 6 || n == 7 || n == 8 || n == 9) ? 'active' : ''}"></path> <!-- 3 -->
                <path d="M12.9486 89.0164H42.7824L53.1041 98.819C52.1487 99.5558 50.9534 100 49.6541 100H5.81579C4.52429 100 3.33852 99.5621 2.38627 98.8339L12.9486 89.0164Z" fill="blue" 
                class="${(n == 0 || n == 2 || n == 3 || n == 5 || n == 6 || n == 8 || n == 9) ? 'active' : ''}"></path> <!-- 4 -->
                <path d="M1.43006 97.9133C0.636383 96.9397 0.159065 95.6979 0.159065 94.3433V55.9851C0.159065 53.7863 1.41584 51.8857 3.24855 50.9492L11.8922 57.4272V88.1888L1.43006 97.9133Z" 
                class="${(n == 0 || n == 2 || n == 6 || n == 8) ? 'active' : ''}"> </path><!-- 5 -->
                <path d="M1.43006 2.0941C0.636383 3.06844 0.159065 4.31102 0.159065 5.66485V44.0231C0.159065 46.2219 1.41584 48.1232 3.24855 49.0589L11.8922 42.5809V11.8194L1.43006 2.0941Z" 
                class="${(n == 0 || n == 4 || n == 5 || n == 6 || n == 8 || n == 9) ? 'active' : ''}"></path> <!-- 6 -->
                <path d="M42.7066 44.0026H12.7624L4.78776 49.881L12.7624 55.7602H24.1791H31.2898H42.7066L50.6812 49.881L42.7066 44.0026Z" 
                class="${(n == 2 || n == 3 || n == 4 || n == 5 || n == 6 || n == 8 || n == 9) ? 'active' : ''}"></path>  <!-- 7 -->
            </svg>`
        }, '')
    }

    /**
    *   Esse método permite apenas que números, Backspace e Enter sejam digitados
    *   @method onlyNumberInter
    *   @param {event} evt evento do onKeydown
    */

    onlyNumberInter(evt) {
        evt = (evt) ? evt : window.event;
        const charCode = (evt.which) ? evt.which : evt.keyCode;

        if (!(charCode >= 48 && charCode <= 57) && !(charCode >= 96 && charCode <= 105) && charCode !== 8 && charCode !== 13) {
            evt.preventDefault()
        }

        if (charCode === 13) this.sendButton.click()
    }

    /**
    *   Esse método remove os pontos e traços do palpite no evento onKeyUp
    *   pois o teclado númerico, de alguns smartphones, permite ponto e traço mesmo com a validação de campo 
    *   @method removeDotDash
    */

    removeDotDash() {
        this.guess.value = this.guess.value.replaceAll('.', '')
        this.guess.value = this.guess.value.replaceAll('-', '')
    }
}