import { useState } from "react"

function App() {
  let [counter,setCounter] = useState(0)

  const addValue = () => {
    // counter = counter + 1
    if (counter < 50){
      setCounter(counter + 1)
    }
  }

  const removeValue = () => {
    // counter = counter - 1
    if (counter > 0) {
      setCounter(counter -1)
    }
  }

  return (
    <>
      <h1>Prathmesh Acharekar</h1>
      <h2>Value: {counter}</h2>

      <button
      onClick={addValue}
      >Add value</button>
      <br />
      <button
      onClick={removeValue}
      >Remove value</button>
    </>
  )
}

export default App
