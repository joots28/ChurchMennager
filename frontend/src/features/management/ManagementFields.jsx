import MemberFields from './forms/MemberFields.jsx';
import MinistryFields from './forms/MinistryFields.jsx';
import EventFields from './forms/EventFields.jsx';
import TransactionFields from './forms/TransactionFields.jsx';
import RoleFields from './forms/RoleFields.jsx';
import ScaleFields from './forms/ScaleFields.jsx';

const forms = {
  members: MemberFields,
  ministries: MinistryFields,
  events: EventFields,
  transactions: TransactionFields,
  roles: RoleFields,
  scales: ScaleFields,
};

export default function ManagementFields({ module, form, changeForm }) {
  const Fields = forms[module];
  return Fields ? <Fields form={form} changeForm={changeForm} /> : null;
}
