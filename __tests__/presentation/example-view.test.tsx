import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ExampleView } from "@/presentation/example-view"

describe("couche présentation", () => {
  it("affiche les éléments reçus", () => {
    render(<ExampleView items={["un", "deux"]} />)
    expect(screen.getByText("un")).toBeInTheDocument()
    expect(screen.getByText("deux")).toBeInTheDocument()
  })
})
