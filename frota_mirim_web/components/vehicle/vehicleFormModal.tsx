"use client";
import {
  Vehicle,
  VehiclePayload,
  VehicleType,
} from "../../services/vehicles.service";
import { translateApiErrors } from "../../utils/translateApiError";
import React, { useEffect, useState } from "react";
import PrimarySelect from "../form/primarySelect";
import PrimarySwitch from "../form/primarySwitch";
import PrimaryModal from "../form/primaryModal";
import PrimaryInput from "../form/primaryInput";
import ColoredTextBox from "../coloredTextBox";
import { toast } from "react-hot-toast";
import LoaderComp from "../loaderComp";
import { AxiosError } from "axios";

type Props = {
  open: boolean;
  loading: boolean;
  initialData?: Vehicle | null;
  onClose: () => void;
  onSubmit: (data: VehiclePayload) => void;
  errors: Record<string, string>;
};

export default function VehicleFormModal({
  open,
  loading = false,
  initialData,
  onClose,
  onSubmit,
  errors,
}: Props) {
  const [infoVisible, setInfoVisible] = useState(false);

  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState<number | "">("");
  const [tipo, setTipo] = useState<VehicleType>("CARRO");
  const [kmAtual, setKmAtual] = useState("");
  const [kmUltimoAbastecimento, setKmUltimoAbastecimento] = useState<
    number | ""
  >("");
  const [vencimentoDocumento, setVencimentoDocumento] = useState<number | null>(
    null,
  );
  const [vencimentoIPVA, setVencimentoIPVA] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaca(initialData.placa);
      setModelo(initialData.modelo);
      setMarca(initialData.marca);
      setAno(initialData.ano);
      setTipo(initialData.tipo);
      setKmAtual(String(initialData.kmAtual).replace(".", ","));
      setKmUltimoAbastecimento(initialData.kmUltimoAbastecimento ?? "");
      setVencimentoDocumento(initialData.licensingDueMonth);
      setVencimentoIPVA(initialData.ipvaDueMonth);
      setIsActive(initialData.isActive);
    } else {
      setPlaca("");
      setModelo("");
      setMarca("");
      setAno("");
      setTipo("CARRO");
      setKmAtual("");
      setKmUltimoAbastecimento("");
      setVencimentoDocumento(null);
      setVencimentoIPVA(null);
      setIsActive(true);
    }
  }, [initialData, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await onSubmit({
        placa: placa.toUpperCase(),
        modelo,
        marca,
        ano: Number(ano),
        tipo,
        kmAtual: Number(kmAtual.replace(",", ".")),
        ...(kmUltimoAbastecimento !== "" && {
          kmUltimoAbastecimento: Number(kmUltimoAbastecimento),
        }),
        licensingDueMonth: Number(vencimentoDocumento),
        ipvaDueMonth: Number(vencimentoIPVA),
        isActive,
      });
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao salvar o veículo");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao salvar o veículo");
          return;
        }
        const { toastMessage } = translateApiErrors(err.response.data);

        toast.error(toastMessage || "Erro ao salvar o veículo");
      }
    }
  }

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2 text-sm font-bold text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="vehicle-form"
        disabled={loading}
        className="px-8 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
      >
        {loading
          ? "Salvando..."
          : initialData
            ? "Salvar Alterações"
            : "Cadastrar Veículo"}
      </button>
    </>
  );

  return (
    <PrimaryModal
      isOpen={open}
      onClose={onClose}
      title={initialData ? "Editar Veículo" : "Novo Veículo"}
      description={
        initialData
          ? "Atualize as informações do veículo."
          : "Cadastre um novo veículo na frota."
      }
      footer={footer}
      size="lg"
      infoVisible={infoVisible}
      setInfoVisible={setInfoVisible}
    >
      <div className="space-y-4 pt-2">
        {infoVisible && (
          <ColoredTextBox type="info" className="mb-4">
            <ul className="list-disc pl-4 text-xs space-y-1">
              <li>A placa deve ser única na frota.</li>
              <li>O KM atual deve refletir a última quilometragem real.</li>
              <li>O sistema utilizará essas datas para alertas automáticos.</li>
            </ul>
          </ColoredTextBox>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <LoaderComp text="Processando..." />
          </div>
        ) : (
          <form
            id="vehicle-form"
            onSubmit={handleSubmit}
            className={`space-y-4 ${
              loading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="grid grid-cols-2 gap-4">
              <PrimaryInput
                label="Placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                error={errors.placa}
              />
              <PrimaryInput
                label="Ano"
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                error={errors.ano}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PrimaryInput
                label="Marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                error={errors.marca}
              />
              <PrimaryInput
                label="Modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                error={errors.modelo}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PrimarySelect
                label="Tipo"
                value={tipo}
                onChange={(val) => setTipo(val as VehicleType)}
                options={[
                  { label: "Carro", value: "CARRO" },
                  { label: "Caminhão", value: "CAMINHAO" },
                  { label: "Moto", value: "MOTO" },
                  { label: "Ônibus", value: "ONIBUS" },
                ]}
              />

              <PrimaryInput
                label="KM Atual"
                type="number"
                decimalScale={1}
                value={kmAtual}
                onChange={(e) => setKmAtual(e.target.value)}
                error={errors.kmAtual}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PrimarySelect
                label="Vencimento Documento"
                searchable
                value={vencimentoDocumento ? String(vencimentoDocumento) : ""}
                onChange={(val) => setVencimentoDocumento(Number(val))}
                options={[
                  { label: "Janeiro", value: "1" },
                  { label: "Fevereiro", value: "2" },
                  { label: "Março", value: "3" },
                  { label: "Abril", value: "4" },
                  { label: "Maio", value: "5" },
                  { label: "Junho", value: "6" },
                  { label: "Julho", value: "7" },
                  { label: "Agosto", value: "8" },
                  { label: "Setembro", value: "9" },
                  { label: "Outubro", value: "10" },
                  { label: "Novembro", value: "11" },
                  { label: "Dezembro", value: "12" },
                ]}
                error={errors.licensingDueMonth}
              />

              <PrimarySelect
                label="Vencimento IPVA"
                searchable
                value={vencimentoIPVA ? String(vencimentoIPVA) : ""}
                onChange={(val) => setVencimentoIPVA(Number(val))}
                options={[
                  { label: "Janeiro", value: "1" },
                  { label: "Fevereiro", value: "2" },
                  { label: "Março", value: "3" },
                  { label: "Abril", value: "4" },
                  { label: "Maio", value: "5" },
                  { label: "Junho", value: "6" },
                  { label: "Julho", value: "7" },
                  { label: "Agosto", value: "8" },
                  { label: "Setembro", value: "9" },
                  { label: "Outubro", value: "10" },
                  { label: "Novembro", value: "11" },
                  { label: "Dezembro", value: "12" },
                ]}
                error={errors.ipvaDueMonth}
              />
            </div>

            <PrimarySwitch
              label="Ativo"
              checked={isActive}
              onChange={setIsActive}
            />
          </form>
        )}
      </div>
    </PrimaryModal>
  );
}
