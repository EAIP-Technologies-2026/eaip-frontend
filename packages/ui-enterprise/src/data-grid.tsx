import type { ReactNode } from "react";

export interface DataGridProps<T> {
  columns: { key: string; header: string; render?: (item: T) => ReactNode }[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export function DataGrid<T>({ columns, data, keyExtractor }: DataGridProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {col.render
                    ? col.render(item)
                    : ((item as Record<string, string>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
