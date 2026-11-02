import { useEffect, useState } from "react";

// Devuelve el valor recién cuando dejó de cambiar durante `demora` ms. Sirve para no hacer
// un request al backend por cada letra que se tipea en el buscador.
export function useValorDiferido(valor, demora = 350) {
  const [valorDiferido, setValorDiferido] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDiferido(valor), demora);
    return () => clearTimeout(temporizador);
  }, [valor, demora]);

  return valorDiferido;
}
