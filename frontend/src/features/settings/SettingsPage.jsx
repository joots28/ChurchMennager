import Icon from '../../components/Icon.jsx';
import Button from '../../components/ui/Button.jsx';
import InputField from '../../components/ui/InputField.jsx';
import { api } from '../../services/httpClient.js';
import './SettingsPage.css';
import '../../components/ui/Panel.css';

export default function SettingsPage({ data, setData, demo, tell }) {
  const updateSetting = (key, value) => {
    setData((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
    }));
  };

  async function saveSettings(event) {
    event.preventDefault();

    try {
      const settings = {
        ...data.settings,
        churchName: String(data.settings.churchName ?? '').trim(),
        email: String(data.settings.email ?? '').trim().toLowerCase(),
        phone: String(data.settings.phone ?? '').trim(),
        address: String(data.settings.address ?? '').trim(),
      };
      if (settings.churchName.length < 2 || settings.churchName.length > 180) {
        throw new Error('O nome da igreja deve ter de 2 a 180 caracteres.');
      }
      if (settings.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
        throw new Error('Informe um e-mail institucional válido.');
      }
      if (settings.phone.length > 40 || settings.address.length > 250) {
        throw new Error('Telefone deve ter até 40 caracteres e endereço até 250 caracteres.');
      }
      if (!demo) {
        const updated = await api('/api/church/settings', {
          method: 'PUT',
          body: JSON.stringify(settings),
        });
        setData((current) => ({ ...current, settings: updated }));
      }
      if (demo) setData(current => ({ ...current, settings }));
      tell('Configurações atualizadas.');
    } catch (error) {
      tell(error.message || 'Não foi possível salvar as configurações.');
    }
  }

  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <div>
          <h2>Dados da instituição</h2>
          <p>Informações utilizadas na identificação do sistema</p>
        </div>
      </div>

      <form className="settings-grid" onSubmit={saveSettings}>
        <InputField label="Nome da igreja" name="churchName" value={data.settings.churchName} onChange={updateSetting} minLength={2} maxLength={180} required />
        <InputField label="E-mail institucional" name="email" type="email" value={data.settings.email} onChange={updateSetting} maxLength={254} required />
        <InputField label="Telefone (opcional)" name="phone" value={data.settings.phone} onChange={updateSetting} maxLength={40} />
        <InputField label="Endereço (opcional)" name="address" value={data.settings.address} onChange={updateSetting} maxLength={250} />
        <div className="settings-submit">
          <Button type="submit">Salvar configurações</Button>
        </div>
      </form>

      <div className="security-note">
        <Icon name="shield" />
        <div>
          <strong>Segurança e permissões</strong>
          <p>Os dados administrativos devem ficar disponíveis apenas para usuários autorizados. Não utilize informações pessoais reais na demonstração pública.</p>
        </div>
      </div>
    </section>
  );
}
