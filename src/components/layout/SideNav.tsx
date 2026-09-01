import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";
import { routeMeta } from "../../router/routes";

const AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAXAHL2nqjMlwdEnuE95fnHUvtM6eICW6LGcw0xkBAVB6ZIIIkWrBS4JuPDv_ENe0ro89GHElBWvSc53MitiO0QsbaiBvzVYgcZaAbROFtDPibe4COSGH_jYbVBITt7wKBN8BCwFpQODqvEyNqCFpjVCm-wcYCmtP9wW-_mNK_DDe31xQLhcw0csNxSvFxeV-Q6Sz4ftBG4tWwxgfB-qaTF943YEeCdsYvycQjJLQcp9Kqoi39t2Zec";

/** Fixed left sidebar: brand header, primary nav, and the signed-in clinician footer. */
export function SideNav() {
  return (
    <nav className="bg-surface h-screen w-[240px] fixed left-0 top-0 border-r border-outline-variant z-50 flex flex-col py-container-margin px-stack-md gap-stack-lg">
      <div className="mb-stack-lg px-stack-md">
        <h1 className="text-title-lg font-title-lg font-bold text-on-surface tracking-tight truncate">
          MediOps Premium
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
          Clinical Command Center
        </p>
      </div>

      <div className="flex flex-col gap-stack-sm flex-1">
        {routeMeta.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-stack-md rounded-full px-stack-md py-stack-sm font-body-md text-body-md transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline focus-visible:ring-offset-1",
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-semibold opacity-90"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors",
              )
            }
          >
            <MaterialSymbol name={item.icon} />
            <span>{item.navLabel}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-stack-sm px-stack-md py-stack-sm">
        <img
          className="w-10 h-10 rounded-full object-cover border border-outline-variant"
          src={AVATAR_SRC}
          alt="Dr. A. Smith"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="font-label-md text-label-md text-on-surface truncate">
            Dr. A. Smith
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            Chief of Risk
          </span>
        </div>
      </div>
    </nav>
  );
}
