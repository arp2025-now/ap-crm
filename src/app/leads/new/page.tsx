import { LeadForm } from '@/components/leads/LeadForm'

export default function NewLeadPage() {
  return (
    <main className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <a href="/pipeline" className="text-sm text-gray-500 hover:text-gray-700">← Pipeline</a>
      </div>
      <h1 className="text-2xl font-bold mb-6">ליד חדש</h1>
      <LeadForm />
    </main>
  )
}
