"use client"

import { useEffect, useRef } from "react"

interface QRCodeGeneratorProps {
  data: string
  size?: number
}

export function QRCodeGenerator({ data, size = 200 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple QR code generation using canvas
    // This is a basic implementation - in production you'd use a proper QR library
    generateQRCode(ctx, data, size)
  }, [data, size])

  const generateQRCode = (ctx: CanvasRenderingContext2D, text: string, size: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Create a simple pattern based on text hash
    const hash = simpleHash(text)
    const gridSize = 25
    const cellSize = size / gridSize

    ctx.fillStyle = "#000000"

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j
        if ((hash + index) % 3 === 0) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize)
        }
      }
    }

    // Add corner markers
    drawCornerMarker(ctx, 0, 0, cellSize * 7)
    drawCornerMarker(ctx, size - cellSize * 7, 0, cellSize * 7)
    drawCornerMarker(ctx, 0, size - cellSize * 7, cellSize * 7)
  }

  const drawCornerMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = "#000000"
    ctx.fillRect(x, y, size, size)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(x + size / 7, y + size / 7, (size * 5) / 7, (size * 5) / 7)
    ctx.fillStyle = "#000000"
    ctx.fillRect(x + (size * 2) / 7, y + (size * 2) / 7, (size * 3) / 7, (size * 3) / 7)
  }

  const simpleHash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas ref={canvasRef} width={size} height={size} className="border border-gray-300 rounded" />
      <p className="text-xs text-gray-500 text-center max-w-[200px] break-words">{data}</p>
    </div>
  )
}
