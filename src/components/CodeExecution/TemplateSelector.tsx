import React, { useState, useEffect } from 'react';
import { FileCode, Search, X } from 'lucide-react';
import { api } from '@/services/api';
import { CodeTemplate } from '@/types';

interface TemplateSelectorProps {
  onSelectTemplate: (template: CodeTemplate) => void;
  onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onClose,
}) => {
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<CodeTemplate[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedLanguage, searchQuery]);

  const loadTemplates = async () => {
    try {
      const response = await api.getCodeTemplates();
      if (response.success) {
        const templateList: CodeTemplate[] = [];
        
        Object.entries(response.templates).forEach(([language, categories]) => {
          Object.entries(categories).forEach(([category, content]) => {
            templateList.push({
              id: `${language}-${category}`,
              name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              description: `${language} template for ${category}`,
              language,
              category,
              content: content as string,
            });
          });
        });
        
        setTemplates(templateList);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;
    
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(t => t.language === selectedLanguage);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }
    
    setFilteredTemplates(filtered);
  };

  const languages = ['all', ...new Set(templates.map(t => t.language))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileCode size={20} />
            Code Templates
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
            </div>
            
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No templates found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="text-left p-4 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {template.language}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {template.description}
                  </p>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-hidden">
                    {template.content.slice(0, 100)}...
                  </pre>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};