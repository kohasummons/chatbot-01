"use client"

import React from "react"
import { ParticleButton } from "@/app/components/ui/particle-button"

export default function AgentButtonDemo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-center">Agent Button Demo</h1>
      
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Default Agent Button</h2>
          <ParticleButton 
            onSuccess={() => console.log('Agent button clicked!')}
            successDuration={1000}
          >
            Talk to Agent
          </ParticleButton>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Secondary Agent Button</h2>
          <ParticleButton 
            variant="secondary"
            onSuccess={() => console.log('Secondary agent button clicked!')}
            successDuration={1000}
          >
            Ask Question
          </ParticleButton>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Outline Agent Button</h2>
          <ParticleButton 
            variant="outline"
            onSuccess={() => console.log('Outline agent button clicked!')}
            successDuration={1000}
          >
            Get Help
          </ParticleButton>
        </div>
      </div>
    </div>
  )
} 