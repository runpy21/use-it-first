import { ImpactPanel } from '../components/ImpactPanel'
import { PageIntro } from '../components/PageIntro'
import { useInventory } from '../hooks/useInventory'
import { recentActivity, summarizeImpact } from '../lib/impact'

export function ImpactPage() {
  const { today, usageHistory } = useInventory()
  const summary = summarizeImpact(usageHistory, today)
  const activity = recentActivity(usageHistory, today)

  return (
    <div className="space-y-8">
      <PageIntro title="Weekly Impact">
        <p>
          A week runs Monday through Sunday. A product counts only when you mark it used on or before its
          expiration date, and only once.
        </p>
      </PageIntro>

      <ImpactPanel summary={summary} recent={activity} />

      <section className="rounded-2xl bg-sage px-5 py-6 sm:px-6">
        <h2 className="text-2xl text-forest">What this number is</h2>
        <ul className="mt-3 max-w-2xl list-disc space-y-2 pl-5 text-ink">
          <li>It counts products, not kilograms and not money.</li>
          <li>The expiration date is copied onto the usage record, so later edits cannot rewrite the past.</li>
          <li>Deleting a product does not record it as used.</li>
          <li>Using something after its date still appears in the activity list, and it is not counted.</li>
        </ul>
      </section>
    </div>
  )
}
