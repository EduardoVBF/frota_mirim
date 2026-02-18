"use client";
import { translateApiErrors } from "../../utils/translateApiError";
import {
  Vehicle,
  VehiclePayload,
  VehicleType,
} from "../../services/vehicles.service";
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
};

export default function VehicleFormModal({
  open,
  loading = false,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [infoVisible, setInfoVisible] = useState(false);

  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [marca, setMarca] = useState("");
  const [ano, setAno] = useState<number | "">("");
  const [tipo, setTipo] = useState<VehicleType>("CARRO");
  const [kmAtual, setKmAtual] = useState<number | "">("");
  const [kmUltimoAbastecimento, setKmUltimoAbastecimento] = useState<
    number | ""
  >("");
  const [vencimentoDocumento, setVencimentoDocumento] = useState("");
  const [vencimentoIPVA, setVencimentoIPVA] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaca(initialData.placa);
      setModelo(initialData.modelo);
      setMarca(initialData.marca);
      setAno(initialData.ano);
      setTipo(initialData.tipo);
      setKmAtual(initialData.kmAtual);
      setKmUltimoAbastecimento(
        initialData.kmUltimoAbastecimento ?? ""
      );
      setVencimentoDocumento(
        new Date(initialData.vencimentoDocumento)
          .toISOString()
          .split("T")[0]
      );
      setVencimentoIPVA(
        new Date(initialData.vencimentoIPVA)
          .toISOString()
          .split("T")[0]
      );
      setIsActive(initialData.isActive);
    } else {
      setPlaca("");
      setModelo("");
      setMarca("");
      setAno("");
      setTipo("CARRO");
      setKmAtual("");
      setKmUltimoAbastecimento("");
      setVencimentoDocumento("");
      setVencimentoIPVA("");
      setIsActive(true);
    }
  }, [initialData, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    try {
      await onSubmit({
        placa: placa.toUpperCase(),
        modelo,
        marca,
        ano: Number(ano),
        tipo,
        kmAtual: Number(kmAtual),
        ...(kmUltimoAbastecimento !== "" && {
          kmUltimoAbastecimento: Number(kmUltimoAbastecimento),
        }),
        vencimentoDocumento,
        vencimentoIPVA,
        isActive,
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const { fieldErrors, toastMessage } = translateApiErrors(
          err.response.data,
        );
        setErrors(fieldErrors);
        toast.error(toastMessage || "Erro ao salvar veículo");
      } else {
        toast.error("Erro inesperado ao salvar");
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

            <div className="grid grid-cols-2 gap-4">
              <PrimaryInput
                label="KM Atual"
                type="number"
                value={kmAtual}
                onChange={(e) => setKmAtual(Number(e.target.value))}
                error={errors.kmAtual}
              />
              <PrimaryInput
                label="KM Último Abastecimento"
                type="number"
                value={kmUltimoAbastecimento}
                onChange={(e) =>
                  setKmUltimoAbastecimento(Number(e.target.value))
                }
                error={errors.kmUltimoAbastecimento}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <PrimaryInput
                label="Vencimento Documento"
                type="date"
                value={vencimentoDocumento}
                onChange={(e) =>
                  setVencimentoDocumento(e.target.value)
                }
                error={errors.vencimentoDocumento}
              />
              <PrimaryInput
                label="Vencimento IPVA"
                type="date"
                value={vencimentoIPVA}
                onChange={(e) => setVencimentoIPVA(e.target.value)}
                error={errors.vencimentoIPVA}
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
