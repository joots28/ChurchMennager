import { useMemo } from 'react';
import { apiResource, DEMO_MODE } from '../services/index.js';
import { toId } from '../utils/appHelpers.js';
import { getRecordDefaults } from '../utils/recordDefaults.js';
import { validateRecord } from '../utils/formValidation.js';
import { downloadCsv } from '../utils/csvExport.js';

export default function useRecordActions({
  module, data, query, dialog, form, setForm, setDialog, setData, setSaving, tell
}) {
  const demo = DEMO_MODE;
  const dataKey = module === 'finance' ? 'transactions' : module;
  const filtered = useMemo(() => {
    const source = data[dataKey] || [];
    if (!query.trim()) return source;
    const search = query.trim().toLocaleLowerCase('pt-BR');
    return source.filter(row => Object.values(row).some(value => String(value ?? '').toLocaleLowerCase('pt-BR').includes(search)));
  }, [data, dataKey, query]);

  const add = () => {
    const resource = module === 'finance' ? 'transactions' : module;
    setForm(getRecordDefaults(resource));
    setDialog({ mode: 'add', resource });
  };

  const edit = row => {
    const resource = module === 'finance' ? 'transactions' : module;
    setForm({ ...row });
    setDialog({ mode: 'edit', resource, id: row.id });
  };

  const remove = async row => {
    const label = row.name || row.title || row.description || 'registro';
    if (!window.confirm(`Excluir "${label}"?`)) return;
    try {
      const resource = module === 'finance' ? 'transactions' : module;
      if (!demo) await apiResource(resource, 'DELETE', row);
      setData(old => ({ ...old, [resource]: old[resource].filter(item => item.id !== row.id) }));
      tell('Registro excluído.');
    } catch (error) {
      tell(error.message || 'Não foi possível excluir.');
    }
  };

  const saveRecord = async event => {
    event.preventDefault();
    if (!dialog) return;
    setSaving(true);
    try {
      const row = { ...form };
      const resource = dialog.resource;
      validateRecord(resource, row);
      if (resource === 'transactions') row.amount = Number(row.amount);
      if (resource === 'roles' && !Array.isArray(row.permissions)) row.permissions = [];

      if (!demo) {
        const method = dialog.mode === 'edit' ? 'PUT' : 'POST';
        const saved = await apiResource(resource, method, {
          ...row,
          ...(dialog.mode === 'edit' ? { id: dialog.id } : {})
        });
        const actual = saved
          ? { ...row, ...saved, id: saved.id ?? dialog.id ?? toId(data[resource]) }
          : { ...row, id: dialog.id ?? toId(data[resource]) };
        setData(old => ({
          ...old,
          [resource]: dialog.mode === 'edit'
            ? old[resource].map(item => item.id === dialog.id ? actual : item)
            : [actual, ...old[resource]]
        }));
      } else {
        const actual = { ...row, id: dialog.mode === 'edit' ? dialog.id : toId(data[resource]) };
        setData(old => ({
          ...old,
          [resource]: dialog.mode === 'edit'
            ? old[resource].map(item => item.id === dialog.id ? actual : item)
            : [actual, ...old[resource]]
        }));
      }

      setDialog(null);
      tell(dialog.mode === 'edit' ? 'Registro atualizado.' : 'Registro cadastrado.');
    } catch (error) {
      tell(error.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const changeForm = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const exportCsv = () => {
    const rows = data[dataKey] || [];
    if (!downloadCsv(rows, `churchmanager-${module}.csv`)) {
      tell('Não há registros para exportar.');
      return;
    }
    tell('Arquivo CSV exportado.');
  };

  return { dataKey, filtered, add, edit, remove, saveRecord, changeForm, handleAction: add, exportCsv };
}
