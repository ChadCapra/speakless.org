{
  description = "Speakless Dev Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      system = "x86_64-linux";  # Adjust if on ARM (e.g., "aarch64-linux")
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs_latest
        ];

		shellHook = ''
			# Automatically install node dependencies if node_modules is missing
			if [ ! -d "node_modules" ]; then
				echo "node_modules not found. Running npm install..."
				npm install
			fi
			
			echo "Speakless dev shell ready!"
        '';
      };
    };
}

