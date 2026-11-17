import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from '../packages/web-ui/src/i18n/locales/en.json';
import '../packages/web-ui/src/index.css';
import {DataGrid} from '@/components/ui/DataGrid';
import {resolveColumnEdits, sourceTableKey, type SourceTableMeta} from '@/utils/columnSources';
import type {ColumnSource} from '@/types/plugins';
import type {TableColumn} from '@/types/editor';

i18next.use(initReactI18next).init({lng: 'en', resources: {en: {translation: en}}});

const col = (name: string, is_pk = false): TableColumn => ({
    name, data_type: 'text', is_pk, is_nullable: true, is_auto_increment: false,
});
const tables: Record<string, SourceTableMeta> = {
    [sourceTableKey({table: 'orders'})]: {columns: [col('id', true), col('total')], isView: false},
    [sourceTableKey({table: 'customers'})]: {columns: [col('id', true), col('name')], isView: false},
};

const scenes: Record<string, any> = {
    join: {
        title: 'SELECT o.id AS order_id, o.total, c.id AS customer_id, c.name, o.total * 1.2 AS gross FROM orders o LEFT JOIN customers c ON c.id = o.customer_id',
        columns: ['order_id', 'total', 'customer_id', 'name', 'gross'],
        sources: [
            {table: 'orders', column: 'id'}, {table: 'orders', column: 'total'},
            {table: 'customers', column: 'id'}, {table: 'customers', column: 'name'}, null,
        ] as Array<ColumnSource | null>,
        data: [[10, 99.5, 3, 'Ada', 119.4], [11, 12, 3, 'Ada', 14.4], [12, 5, null, null, 6]],
    },
    selfjoin: {
        title: 'SELECT a.id, a.name, b.name FROM customers a JOIN customers b ON b.id = a.id + 1   (PostgreSQL / SQLite: no table_alias reported)',
        columns: ['id', 'name', 'name'],
        sources: [
            {table: 'customers', column: 'id'}, {table: 'customers', column: 'name'},
            {table: 'customers', column: 'name'},
        ] as Array<ColumnSource | null>,
        data: [[1, 'Ada', 'Grace'], [2, 'Grace', 'Linus']],
    },
};

function Scene() {
    const params = new URLSearchParams(location.search);
    const name = params.get('scene') ?? 'join';
    const mode = params.get('mode') ?? 'after';
    const scene = scenes[name];
    const edits = mode === 'before' ? undefined : resolveColumnEdits(scene.columns, scene.sources, tables);
    const [pending, setPending] = useState<Record<string, any>>({});
    const onPendingChange = (pk: any, colName: string, value: unknown, target?: any) => {
        const key = target?.key ?? JSON.stringify(pk);
        setPending((p) => {
            const entry = p[key] ?? {pkOriginalValue: pk, changes: {}, target};
            const changes = {...entry.changes};
            if (value === undefined) delete changes[colName]; else changes[colName] = value;
            const next = {...p};
            if (Object.keys(changes).length === 0) delete next[key]; else next[key] = {...entry, changes};
            return next;
        });
    };
    return (
        <div style={{padding: 16, width: 1000}} className="bg-base text-primary">
            <div style={{fontFamily: 'monospace', fontSize: 12, marginBottom: 8}}>
                {mode === 'before' ? 'BEFORE (no column_sources): ' : 'AFTER: '}{scene.title}
            </div>
            <div id="grid" style={{height: 190}}>
                <DataGrid
                    columns={scene.columns}
                    data={scene.data}
                    tableName={null}
                    pkColumns={null}
                    columnEdits={edits}
                    pendingChanges={pending}
                    onPendingChange={onPendingChange}
                    selectedRows={new Set()}
                    onSelectionChange={() => undefined}
                    readonly={mode === 'before'}
                />
            </div>
            <Legend />
        </div>
    );
}

function Legend() {
    const [labels, setLabels] = useState<string[]>([]);
    React.useEffect(() => {
        const t = setTimeout(() => {
            const out = Array.from(document.querySelectorAll('th button[data-column-edit]')).map((b) => {
                const th = b.closest('th');
                const name = th?.textContent ?? '';
                return `${b.getAttribute('data-column-edit')}: ${b.getAttribute('aria-label')}`;
            });
            setLabels(out);
        }, 300);
        return () => clearTimeout(t);
    }, []);
    return (
        <ul id="legend" style={{fontSize: 12, marginTop: 8}}>
            {labels.map((l, i) => <li key={i}>{`column ${i + 1} - ${l}`}</li>)}
        </ul>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Scene />);
