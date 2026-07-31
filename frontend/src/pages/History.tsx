import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  History as HistoryIcon,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { getAllPredictions, deletePrediction } from '../lib/api';
import type { Prediction, SortField, SortOrder } from '../lib/types';

export default function History() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    setLoading(true);
    const data = await getAllPredictions();
    setPredictions(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const success = await deletePrediction(id);
    if (success) {
      setPredictions((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteConfirm(null);
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...predictions];

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.patient_name.toLowerCase().includes(lower) ||
          p.patient_id.toLowerCase().includes(lower) ||
          p.predicted_disease.toLowerCase().includes(lower)
      );
    }

    if (diseaseFilter !== 'all') {
      result = result.filter((p) => {
        if (diseaseFilter === 'normal') return p.predicted_disease === 'Normal';
        if (diseaseFilter === 'pcos') return p.predicted_disease.includes('PCOS');
        if (diseaseFilter === 'cyst') return p.predicted_disease.includes('Cyst');
        if (diseaseFilter === 'endo') return p.predicted_disease.includes('Endometri');
        return true;
      });
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'patient_name':
          cmp = a.patient_name.localeCompare(b.patient_name);
          break;
        case 'confidence_score':
          cmp = Number(a.confidence_score) - Number(b.confidence_score);
          break;
        case 'predicted_disease':
          cmp = a.predicted_disease.localeCompare(b.predicted_disease);
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [predictions, search, diseaseFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-pink-500" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-pink-500" />
    );
  };

  const diseaseBadge = (disease: string) => {
    if (disease === 'Normal')
      return 'bg-emerald-50 text-emerald-600';
    if (disease.includes('PCOS'))
      return 'bg-amber-50 text-amber-600';
    if (disease.includes('Cyst'))
      return 'bg-rose-50 text-rose-600';
    if (disease.includes('Endometri'))
      return 'bg-violet-50 text-violet-600';
    return 'bg-slate-50 text-slate-600';
  };

  const reportStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'printed':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-pink-500" />
            Prediction History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {predictions.length} total prediction{predictions.length !== 1 ? 's' : ''} ·{' '}
            {filteredAndSorted.length} shown
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, ID, or disease..."
              className="w-full pl-10 pr-3 py-2.5 glass rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="px-3 py-2.5 glass rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
            >
              <option value="all">All Diseases</option>
              <option value="normal">Normal</option>
              <option value="pcos">PCOS</option>
              <option value="cyst">Ovarian Cyst</option>
              <option value="endo">Endometriosis</option>
            </select>
          </div>

          {(search || diseaseFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setDiseaseFilter('all');
              }}
              className="flex items-center gap-1 px-3 py-2.5 glass rounded-xl text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Loading predictions...</p>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1">No predictions found</p>
            <p className="text-xs text-slate-400">
              {predictions.length === 0
                ? 'Run your first AI analysis to see it here'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200/50 bg-slate-50/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-pink-600 transition-colors"
                    onClick={() => toggleSort('patient_name')}
                  >
                    <div className="flex items-center gap-1">
                      Patient <SortIcon field="patient_name" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-pink-600 transition-colors"
                    onClick={() => toggleSort('predicted_disease')}
                  >
                    <div className="flex items-center gap-1">
                      Disease <SortIcon field="predicted_disease" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-pink-600 transition-colors"
                    onClick={() => toggleSort('confidence_score')}
                  >
                    <div className="flex items-center gap-1">
                      Confidence <SortIcon field="confidence_score" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-pink-600 transition-colors"
                    onClick={() => toggleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Date <SortIcon field="created_at" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((pred, i) => (
                  <tr
                    key={pred.id}
                    className="border-b border-slate-100/50 hover:bg-white/40 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {pred.image_url ? (
                          <img
                            src={pred.image_url}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{pred.patient_name}</p>
                      <p className="text-xs text-slate-400">
                        {pred.patient_id}
                        {pred.patient_age ? ` · ${pred.patient_age}y` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-medium ${diseaseBadge(
                          pred.predicted_disease
                        )}`}
                      >
                        {pred.predicted_disease}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-400 to-purple-600 rounded-full"
                            style={{ width: `${Number(pred.confidence_score)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {Number(pred.confidence_score).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">{pred.model_used}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">
                        {new Date(pred.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(pred.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {reportStatusIcon(pred.report_status)}
                        <span className="text-xs text-slate-500 capitalize">
                          {pred.report_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/prediction/${pred.id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          title="View prediction"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(pred.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete prediction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="glass-card rounded-2xl p-6 max-w-sm mx-4 animate-fade-in-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Delete Prediction?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to permanently delete this prediction record? All associated
              data will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 glass rounded-xl text-sm font-medium text-slate-600 hover:bg-white/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
