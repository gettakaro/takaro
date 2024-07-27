/* eslint-disable quotes */
export function formatAlterTableEnumSql(tableName: string, columnName: string, enums: string[]) {
  const constraintName = `${tableName}_${columnName}_check`;
  return [
    `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}";`,
    `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" CHECK ("${columnName}" = ANY (ARRAY['${enums.join(
      "'::text, '",
    )}'::text]));`,
  ].join('\n');
}
