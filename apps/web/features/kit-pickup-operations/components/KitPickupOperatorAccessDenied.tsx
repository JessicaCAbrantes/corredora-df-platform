import Link from "next/link";
import { Footer } from "../../../../../packages/ui/src/components/Footer";
import { Layout } from "../../../../../packages/ui/src/components/Layout";
import { SiteNavbar } from "../../auth/components/SiteNavbar";

export function KitPickupOperatorAccessDenied() {
  return (
    <Layout className="kit-ops-page">
      <SiteNavbar />
      <main id="main-content" className="kit-ops-page__main">
        <div className="kit-ops-page__panel">
          <h1 className="kit-ops-page__title">Acesso restrito a operadores</h1>
          <p>
            Sua conta não possui permissão para acessar a operação de retirada de
            kits. Entre em contato com a Corredora DF se precisar de acesso.
          </p>
          <p>
            <Link href="/">Voltar para a Home</Link>
          </p>
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
