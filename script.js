class GeradorSenhas {
    constructor() {
        this.elementos = {
            senhaGerada: document.getElementById('senhaGerada'),
            tamanho: document.getElementById('tamanhoSenha'),
            tamanhoValor: document.getElementById('tamanhoValor'),
            incluirMaiusculas: document.getElementById('incluirMaiusculas'),
            incluirMinusculas: document.getElementById('incluirMinusculas'),
            incluirNumeros: document.getElementById('incluirNumeros'),
            incluirEspeciais: document.getElementById('incluirEspeciais'),
            gerarBtn: document.getElementById('gerarSenha'),
            copiarBtn: document.getElementById('copiarSenha'),
            indicadorForca: document.getElementById('indicadorForca'),
            textoForca: document.getElementById('textoForca')
        };

        this.caracteres = {
            maiusculas: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            minusculas: 'abcdefghijklmnopqrstuvwxyz',
            numeros: '0123456789',
            especiais: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        this.inicializarEventos();
        this.gerarSenha();
    }

    inicializarEventos() {
        this.elementos.gerarBtn.addEventListener('click', () => this.gerarSenha());
        this.elementos.copiarBtn.addEventListener('click', () => this.copiarSenha());
        this.elementos.tamanho.addEventListener('input', () => this.atualizarTamanho());
        
        // Regenerar senha quando qualquer opção for alterada
        document.querySelectorAll('.opcoes input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.gerarSenha());
        });

        // Gerar senha ao pressionar Enter no campo de tamanho
        this.elementos.tamanho.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.gerarSenha();
        });
    }

    atualizarTamanho() {
        const valor = this.elementos.tamanho.value;
        this.elementos.tamanhoValor.textContent = valor;
        this.gerarSenha();
    }

    gerarSenha() {
        const tamanho = parseInt(this.elementos.tamanho.value);
        const opcoes = {
            maiusculas: this.elementos.incluirMaiusculas.checked,
            minusculas: this.elementos.incluirMinusculas.checked,
            numeros: this.elementos.incluirNumeros.checked,
            especiais: this.elementos.incluirEspeciais.checked
        };

        // Verificar se pelo menos uma opção está selecionada
        if (!Object.values(opcoes).some(v => v)) {
            this.elementos.senhaGerada.value = 'Selecione pelo menos uma opção';
            this.atualizarForca(0);
            return;
        }

        const senha = this.construirSenha(tamanho, opcoes);
        this.elementos.senhaGerada.value = senha;
        this.avaliarForca(senha);
    }

    construirSenha(tamanho, opcoes) {
        let caracteresDisponiveis = '';
        let senha = '';

        if (opcoes.maiusculas) caracteresDisponiveis += this.caracteres.maiusculas;
        if (opcoes.minusculas) caracteresDisponiveis += this.caracteres.minusculas;
        if (opcoes.numeros) caracteresDisponiveis += this.caracteres.numeros;
        if (opcoes.especiais) caracteresDisponiveis += this.caracteres.especiais;

        // Garantir que pelo menos um caractere de cada tipo selecionado seja incluído
        const tiposSelecionados = [];
        if (opcoes.maiusculas) tiposSelecionados.push(this.caracteres.maiusculas);
        if (opcoes.minusculas) tiposSelecionados.push(this.caracteres.minusculas);
        if (opcoes.numeros) tiposSelecionados.push(this.caracteres.numeros);
        if (opcoes.especiais) tiposSelecionados.push(this.caracteres.especiais);

        // Adicionar pelo menos um caractere de cada tipo
        for (const tipo of tiposSelecionados) {
            const indice = Math.floor(Math.random() * tipo.length);
            senha += tipo[indice];
        }

        // Preencher o resto da senha
        for (let i = senha.length; i < tamanho; i++) {
            const indice = Math.floor(Math.random() * caracteresDisponiveis.length);
            senha += caracteresDisponiveis[indice];
        }

        // Embaralhar a senha
        return this.embaralharString(senha);
    }

    embaralharString(string) {
        const array = string.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    avaliarForca(senha) {
        if (!senha || senha.length === 0) {
            this.atualizarForca(0);
            return;
        }

        let pontuacao = 0;
        
        // Critérios de força
        if (senha.length >= 8) pontuacao += 1;
        if (senha.length >= 12) pontuacao += 1;
        if (senha.length >= 16) pontuacao += 1;
        
        if (/[a-z]/.test(senha)) pontuacao += 1;
        if (/[A-Z]/.test(senha)) pontuacao += 1;
        if (/[0-9]/.test(senha)) pontuacao += 1;
        if (/[^a-zA-Z0-9]/.test(senha)) pontuacao += 1;
        
        // Verificar variedade de caracteres
        const caracteresUnicos = new Set(senha).size;
        if (caracteresUnicos / senha.length > 0.7) pontuacao += 1;

        // Normalizar pontuação para 0-100
        const pontuacaoMaxima = 8;
        const porcentagem = Math.min((pontuacao / pontuacaoMaxima) * 100, 100);
        
        this.atualizarForca(porcentagem);
    }

    atualizarForca(porcentagem) {
        const indicador = this.elementos.indicadorForca;
        const texto = this.elementos.textoForca;
        
        indicador.style.width = `${porcentagem}%`;
        
        if (porcentagem < 33) {
            indicador.className = 'forca-fraca';
            texto.textContent = 'Fraca';
            texto.style.color = '#dc3545';
        } else if (porcentagem < 66) {
            indicador.className = 'forca-media';
            texto.textContent = 'Média';
            texto.style.color = '#ffc107';
        } else {
            indicador.className = 'forca-forte';
            texto.textContent = 'Forte';
            texto.style.color = '#28a745';
        }
    }

    async copiarSenha() {
        const senha = this.elementos.senhaGerada.value;
        
        if (!senha || senha === 'Selecione pelo menos uma opção') {
            this.mostrarNotificacao('Nenhuma senha para copiar!', 'erro');
            return;
        }

        try {
            await navigator.clipboard.writeText(senha);
            this.elementos.copiarBtn.classList.add('copiado');
            this.elementos.copiarBtn.textContent = '✅';
            this.mostrarNotificacao('Senha copiada com sucesso!', 'sucesso');
            
            setTimeout(() => {
                this.elementos.copiarBtn.classList.remove('copiado');
                this.elementos.copiarBtn.textContent = '📋';
            }, 2000);
        } catch (err) {
            this.mostrarNotificacao('Erro ao copiar senha!', 'erro');
            console.error('Erro ao copiar:', err);
        }
    }

    mostrarNotificacao(mensagem, tipo) {
        // Criar notificação simples
        const notificacao = document.createElement('div');
        notificacao.textContent = mensagem;
        notificacao.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideUp 0.3s ease-out;
            background: ${tipo === 'sucesso' ? '#28a745' : '#dc3545'};
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;

        // Adicionar animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notificacao);

        setTimeout(() => {
            notificacao.style.opacity = '0';
            notificacao.style.transform = 'translateX(-50%) translateY(-20px)';
            notificacao.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notificacao);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
}

// Inicializar o gerador quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new GeradorSenhas();
});