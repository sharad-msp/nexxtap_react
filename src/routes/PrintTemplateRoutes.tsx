import { Routes, Route } from 'react-router-dom';
import PrintTemplateList from '@/pages/print-templates/PrintTemplateList';
import PrintTemplateForm from '@/pages/print-templates/PrintTemplateForm';
import PrintTemplateView from '@/pages/print-templates/PrintTemplateView';

const PrintTemplateRoutes = () => {
  return (
    <Routes>
      <Route index element={<PrintTemplateList />} />
      <Route path="add" element={<PrintTemplateForm />} />
      <Route path="edit/:id" element={<PrintTemplateForm />} />
      <Route path="view/:id" element={<PrintTemplateView />} />
    </Routes>
  );
};

export default PrintTemplateRoutes;
