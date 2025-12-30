import { motion } from 'framer-motion';
import { Store, CreditCard, Bell, Shield, Palette, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const AdminSettings = () => {
  const settingsSections = [
    {
      icon: Store,
      title: 'Store Information',
      description: 'Update your store name, description, and contact details',
      fields: [
        { label: 'Store Name', value: 'iTag Store', type: 'text' },
        { label: 'Contact Email', value: 'support@itag.com', type: 'email' },
        { label: 'Support Phone', value: '+1 (555) 123-4567', type: 'tel' },
      ],
    },
    {
      icon: CreditCard,
      title: 'Payment Settings',
      description: 'Configure payment methods and currencies',
      fields: [
        { label: 'Currency', value: 'USD', type: 'text' },
        { label: 'Tax Rate (%)', value: '8.5', type: 'number' },
      ],
    },
  ];

  const toggleSettings = [
    { icon: Bell, title: 'Email Notifications', description: 'Receive email alerts for new orders', enabled: true },
    { icon: Shield, title: 'Two-Factor Authentication', description: 'Add an extra layer of security', enabled: false },
    { icon: Globe, title: 'International Shipping', description: 'Enable shipping to international addresses', enabled: true },
    { icon: Palette, title: 'Dark Mode', description: 'Use dark theme for admin panel', enabled: true },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration</p>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Form Settings */}
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <section.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                <p className="text-muted-foreground">{section.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {field.label}
                  </label>
                  <Input type={field.type} defaultValue={field.value} />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <Button>Save Changes</Button>
            </div>
          </motion.div>
        ))}

        {/* Toggle Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {toggleSettings.map((setting, index) => (
            <div
              key={setting.title}
              className={`flex items-center justify-between p-6 ${
                index < toggleSettings.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <setting.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{setting.title}</div>
                  <div className="text-sm text-muted-foreground">{setting.description}</div>
                </div>
              </div>
              <Switch defaultChecked={setting.enabled} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
