export function camelCaseToSpaces(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  });
}
