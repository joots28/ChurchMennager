import React from 'react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro de renderização no ChurchManager:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-screen" role="alert">
          <section className="app-error-card">
            <h1>Não foi possível carregar esta tela</h1>
            <p>Ocorreu um erro inesperado na interface. Seus dados salvos no servidor não foram apagados.</p>
            <button type="button" onClick={() => window.location.reload()}>
              Recarregar aplicação
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
