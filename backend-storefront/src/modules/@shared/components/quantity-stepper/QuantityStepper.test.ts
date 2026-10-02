import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import ts from "typescript"
import { describe, expect, it, vi } from "vitest"

function harness(defaultValue = 120, commitOnBlur = true) {
  const state: unknown[] = []
  let cursor = 0
  const onChange = vi.fn()
  const exports: any = {}
  const jsx = (type: unknown, props: unknown) => ({ type, props })
  const source = readFileSync(new URL("./QuantityStepper.tsx", import.meta.url), "utf8")
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  runInNewContext(code, { exports, require: (name: string) =>
    name === "react/jsx-runtime" ? { jsx, jsxs: jsx } : {
      useState: (initial: any) => {
        const index = cursor++
        if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial
        return [state[index], (next: unknown) => { state[index] = next }]
      },
      useEffect: (effect: () => void, deps: unknown[]) => {
        const index = cursor++, value = JSON.stringify(deps)
        if (state[index] !== value) { state[index] = value; effect() }
      },
    } })
  const render = (next = defaultValue) => {
    cursor = 0
    return exports.QuantityStepper({ defaultValue: next, max: 999, commitOnBlur, onChange }).props.children
  }
  return { render, onChange }
}

describe("quantity editing", () => {
  it("preserves quantities over 99 without writing on untouched blur", () => {
    const { render, onChange } = harness()
    expect(render()[1].props.value).toBe("120")
    render()[1].props.onBlur()
    expect(onChange).not.toHaveBeenCalled()
  })
  it("sends just the final quantity after typing", () => {
    const { render, onChange } = harness(1)
    for (const value of ["", "1", "12", "120"]) render()[1].props.onChange({ target: { value } })
    expect(onChange).not.toHaveBeenCalled()
    render()[1].props.onBlur()
    expect(onChange).toHaveBeenCalledExactlyOnceWith(120)
  })
  it("restores an empty cart draft without sending quantity 1", () => {
    const { render, onChange } = harness(12)
    render()[1].props.onChange({ target: { value: "" } })
    render()[1].props.onBlur()
    expect(render()[1].props.value).toBe("12")
    expect(onChange).not.toHaveBeenCalled()
  })
  it("synchronizes server quantity changes", () => {
    const { render } = harness(12)
    render(); render(20)
    expect(render(20)[1].props.value).toBe("20")
  })
  it("retains immediate PDP totals for valid drafts", () => {
    const { render, onChange } = harness(1, false)
    render()[1].props.onChange({ target: { value: "4" } })
    expect(onChange).toHaveBeenLastCalledWith(4)
  })
})
