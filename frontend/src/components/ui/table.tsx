import React from 'react';
import { cn } from '../../utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

const Table: React.FC<TableProps> = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
);

const TableHeader: React.FC<TableHeaderProps> = ({ className, ...props }) => (
  <thead className={cn('[&_tr]:border-b', className)} {...props} />
);

const TableBody: React.FC<TableBodyProps> = ({ className, ...props }) => (
  <tbody
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
);

const TableRow: React.FC<TableRowProps> = ({ className, ...props }) => (
  <tr
    className={cn(
      'border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100',
      className
    )}
    {...props}
  />
);

const TableHead: React.FC<TableHeadProps> = ({ className, ...props }) => (
  <th
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
);

const TableCell: React.FC<TableCellProps> = ({ className, ...props }) => (
  <td
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
);

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};