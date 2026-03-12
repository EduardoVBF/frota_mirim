"use client";
import {
  getHeaderAlerts,
  markAlertRead,
  Alert,
} from "@/services/alerts.service";
import { useEffect, useState, useCallback, useRef } from "react";
import AlertSeverityBadge from "./alertSeverityBadge";
import relativeTime from "dayjs/plugin/relativeTime";
import { Eye, TriangleAlert } from "lucide-react";
import AlertTypeIcon from "./alertTypeIcon";
import Link from "next/link";
import dayjs from "dayjs";

dayjs.extend(relativeTime);

export default function AlertsDropdown() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);

  const mountedRef = useRef(true);
  const previousCount = useRef(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getHeaderAlerts();

      if (!mountedRef.current) return;

      const newAlerts = data.items || [];

      if (
        previousCount.current !== 0 &&
        newAlerts.length > previousCount.current
      ) {
        setAnimate(true);

        setTimeout(() => {
          setAnimate(false);
        }, 800);
      }

      previousCount.current = newAlerts.length;

      setAlerts(newAlerts);
    } catch (err) {
      console.error("Erro ao buscar alertas", err);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    queueMicrotask(fetchAlerts);

    const interval = setInterval(fetchAlerts, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchAlerts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleRead(id: string) {
    await markAlertRead(id);
    fetchAlerts();
  }

  const unread = alerts.filter((a) => !a.isRead).length;

  return (
    <div ref={dropdownRef} className="relative">
      {/* BOTÃO */}
      <button
        onClick={() => setOpen(!open)}
        className={`p-2 text-muted hover:text-warning cursor-pointer relative ${animate ? "animate-pulse" : ""
          }`}
      >
        <TriangleAlert size={20} />

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-error text-white rounded-full px-1.5 font-bold">
            {unread}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-120 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex justify-between items-center p-3 border-b border-border">
            <div className="flex items-center gap-1">
              <TriangleAlert size={16} className="text-warning" />
              <span>
                Alertas recentes
              </span>
            </div>

            <Link
              href="/alertas"
              className="text-xs text-accent font-bold hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {alerts.length === 0 && (
            <div className="p-6 text-sm text-muted text-center">
              Nenhum alerta ativo
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex gap-3 items-start p-3 border-b border-border hover:bg-alternative-bg ${!alert.isRead ? "bg-accent/5" : ""
                  }`}
              >
                <div className="mt-1 text-muted">
                  <AlertTypeIcon type={alert.type} />
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <AlertSeverityBadge severity={alert.severity} />

                    <span className="text-sm text-muted">
                      #{alert.sequenceId} -
                    </span>

                    <span className="text-xs text-muted">
                      {dayjs(alert.createdAt).fromNow()}
                    </span>
                  </div>

                  <span className="text-sm font-medium">{alert.title}</span>

                  <span className="text-xs text-muted">
                    {alert.message}
                  </span>
                </div>

                {!alert.isRead && (
                  <button
                    onClick={() => handleRead(alert.id)}
                    className="text-muted hover:text-accent"
                    title="Lido"
                  >
                    <Eye size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}