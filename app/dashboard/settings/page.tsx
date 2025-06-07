export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold tracking-tight">Settings</h3>
        <p className="text-muted-foreground">
          Configure your site preferences and integrations
        </p>
      </div>
      
      <div className="flex items-center justify-center p-12">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h4 className="text-xl font-semibold mb-2">Coming Soon</h4>
          <p className="text-muted-foreground">
            The settings interface is currently under development.
          </p>
        </div>
      </div>
    </div>
  )
}