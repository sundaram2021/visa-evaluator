import { ResultsDisplay } from "@/components/results-display"
import EvaluationProgress from "@/components/evaluation-progress"
import { getEvaluationById } from "@/lib/db"

export default async function EvaluationPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ jobId?: string }>
    searchParams?: Promise<{ embed?: string }>
}) {
    const { jobId } = await params
    const id = jobId ?? ""
    const search = await searchParams
    const isEmbed = search?.embed === "true"

    console.log("Loading evaluation page for id:", id, "isEmbed:", isEmbed)

    if (!id) {
        return (
            <main className="min-h-screen bg-background py-12">
                <div className="container mx-auto max-w-2xl">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-6">
                        <h2 className="text-xl font-bold mb-2">Invalid link</h2>
                        <p className="mb-1">We couldn&apos;t find an evaluation for the provided link.</p>
                        <p className="text-sm text-muted-foreground">Ensure you are using a valid report URL.</p>
                    </div>
                </div>
            </main>
        )
    }

    // First, try to load from MongoDB as an evaluation
    const evaluation = await getEvaluationById(id)

    // If found in MongoDB, render the results
    if (evaluation) {
        const resultProps = {
            id: evaluation.id,
            score: evaluation.score || 0,
            summary: evaluation.summary || "",
            strengths: evaluation.strengths || [],
            improvements: evaluation.improvements || [],
            recommendation: evaluation.recommendation || "",
            evaluationId: evaluation.id,
            nextSteps: evaluation.nextSteps || [],
            timeline: evaluation.timeline || "",
            additionalNotes: evaluation.additionalNotes || "",
            name: evaluation.name || "",
            email: evaluation.email || "",
            country: evaluation.country || "",
            visaType: evaluation.visaType || "",
        }

        return (
            <main className="min-h-screen bg-background py-6">
                <div className="container mx-auto">
                    <ResultsDisplay results={resultProps} showEmbedPreview={!isEmbed} />
                </div>
            </main>
        )
    }

    // If not found in MongoDB, assume it's a job ID and show progress
    // (for when evaluation is still being processed)
    if (id.startsWith("job_") || id.length === 24) {
        return <EvaluationProgress jobId={id} />
    }

    // Nothing found
    return (
        <main className="min-h-screen bg-background py-12">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-yellow-50 border border-yellow-200 rounded p-6">
                    <h2 className="text-xl font-bold mb-2">Report not found</h2>
                    <p className="mb-1">We couldn&apos;t find an evaluation for the provided id.</p>
                    <p className="text-sm text-muted-foreground">Ensure you are using a valid report link.</p>
                </div>
            </div>
        </main>
    )
}