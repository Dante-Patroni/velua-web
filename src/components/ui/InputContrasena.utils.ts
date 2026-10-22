/**
 * @description Atributos del campo según si la contraseña se ve o no. Cuando se
 * muestra, el campo pasa a texto: se apagan el corrector, el autocorrector y las
 * mayúsculas automáticas, porque el corrector mejorado de algunos navegadores
 * manda lo que se escribe a un servidor.
 * @param visible Si la contraseña se está mostrando.
 * @returns Atributos que el campo aplica por encima de los que recibe.
 */
export function atributosContrasena(visible: boolean) {
  return {
    type: visible ? "text" : "password",
    spellCheck: false,
    autoCorrect: "off",
    autoCapitalize: "off",
  } as const;
}