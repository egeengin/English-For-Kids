import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-sky-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-6 text-center space-y-4">
            <div className="text-6xl">🧱⚡</div>
            <h1 className="text-2xl font-display font-black text-slate-900">
              Küçük Bir Lego Parçası Kaydı!
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Sayfayı yenileyerek kaldığın yerden eğlenceye devam edebilirsin. Yıldızların ve ödüllerin güvende!
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-base shadow-lg cursor-pointer transition active:scale-95"
            >
              🔄 Yeniden Başlat
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
