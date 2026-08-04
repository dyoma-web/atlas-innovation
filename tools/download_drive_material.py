# -*- coding: utf-8 -*-
"""Descarga el material gráfico de los 20 casos Spotlight desde Google Drive
(carpeta compartida "spotlighted cases", inventariada el 2026-08-03 vía conector).

Destino: Insumos/spotlight_drive/<case_id>_<slug>/
Se omiten videos (mp4) y el JPG de 33 MB de Not Alone (hay alternativas).
"""
import io, sys, os, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, 'Insumos', 'spotlight_drive')

# (case_id, slug, [(file_id, nombre_destino), ...])
MATERIAL = [
    ('c001', 'e-eu-sou-o-que', [
        ('1keJgiN5hPx77Znz1df0hatkoeFW3lo9I', 'cartilha-racial-2025.pdf'),
        ('1q0VlaYRuC5Iux_OTVaVXqqTxUqv5EkSs', 'apresentacao-2025.pdf')]),
    ('c002', 'saude-direitos-pcd', [
        ('1k_wcZkq0SiSXZd7wuK7lGtv2E6XeFRjM', 'img-115746512-alta.jpg'),
        ('1pZosDD2Yh5ZYClyG9TD4jg-w1AVGMF__', 'imagem-alta-1.jpg'),
        ('1vnanXT_pkBQ4rB8mCvdvVPg74vTv6hWL', 'capa-zona-sul-este.jpeg')]),
    ('c003', 'olhares-plurais', [
        ('1wuSPQXT03qC3Cvzv03l-ZHBFd2yykmWb', 'mockup-boletins.jpg'),
        ('1hO6bEV9SopfAcmeyhee1oDcLwNWAVh0v', 'banner-marca.jpg'),
        ('17HVGkgB4dG0fl-rLWMIBan1ia-KM1cys', 'foto-cafe-com-mef-cnj.jpg')]),
    ('c004', 'portal-tcu', [
        ('1Y2FaV2w_BnKk9O6CkVqS2f6fZ8egHhNi', 'tcu-vetorizadas.zip')]),
    ('c005', 'tiny-town-hall', [
        ('1f2bHbS7uqTUBAxqSUHB0RK4THh8RyBsg', 'tiny-rathaus-foto.jpg'),
        ('1HvrvoydPvE3pVkALc92nYFGHccyY06QE', 'logo-smarter-leben.jpg')]),
    ('c006', 'extra-favelas', [
        ('1pnCZTRcVVzg7cisNq9PvrpxSxG6huUR0', 'extra-favelas-urbanismo.jpg'),
        ('1lZD3KTj1nQ_OZcTa89bHBfIQCVaetrIZ', 'extra-favelas-mobilidade.jpg'),
        ('1X5gEjTMTJJjOzk8rvLHZd-9p06BYaMDV', 'extra-favelas-dignidade.jpg'),
        ('1M1ux99HFM_Vr0tJJ-W4NKcBp2v6RgrNY', 'logo-extra-favelas.png')]),
    ('c007', 'voices-of-resilience', [
        ('1IiS4QoZN6Nn8uBcRCgHE8xzPPGcGSMEs', 'img-2365.jpg'),
        ('1Evwrx4ZtOnZgOEJxFkwL_NlUUbrV2Y8V', 'img-2369.jpg'),
        ('1xkLvvIDVnRbiwaqRQ-MZZa0KC9oO6mFZ', 'fb-template.png'),
        ('12sTbrzbRQks5G1lXQK5DMgl9uIlpNnZY', 'fb-photo-490213650.jpg')]),
    ('c008', 'chatnation', [
        ('1sWZO8Qa0nhmTWCaElHIEGXk3aOVZJS-N', 'ecityzens-cards.png'),
        ('17p6zH4rKpnNYgJkX-n-BdAruTdRPqZLS', 'screenshot-plataforma.png'),
        ('1POKS9QxeKzx0YV_jGaV1ewzkhT0zsSEF', 'chatnation-logo.png')]),
    ('c009', 'ecovr', [
        ('1hK7VT4VgD6DTkD5eP7NL_ZahmzGl-ZBc', 'ecovr-1.tif'),
        ('1-awVUe9a2Tfn-y-V3YtDrhILIYhzKvh9', 'ecovr-3.tif')]),
    ('c010', 'not-alone', [
        ('13cVyBKPZ67RBGoCpsH81PKL02WM2zbxU', 'school-tour-2.jpg'),
        ('1_20BJDg-kzGhP-Hzoh1x9VjKq_NahIeN', 'school-tour-1.jpg'),
        ('1h2zQRqhNqMHdY5Tz0EUvGJRXL5FXD7DN', 'music-event-1.png')]),
    ('c011', 'mulheres-em-dialogo', [
        ('1wJ_28aYkJcON5E3ElZYK2aRSVIM-n3hQ', 'mg-9342.jpg'),
        ('1oyL4D7g9Qu5k0B_rAYZLvw6-xyinXG7i', 'mg-9436.jpg'),
        ('1_ibsC77Ve_U6ezcF4rpKuvgJFMZUxCi4', 'mg-9446.jpg')]),
    ('c012', 'bhashini', [
        ('1a1e1vCGd26uhJApm0zQM8SgxZdPiKIsR', 'bhashini-logo.png'),
        ('1pwZSvefJfDu_hBtE1ki5m1FZcEpJ_NDs', 'amitabh-photo.png')]),
    ('c013', 'weaving-web-of-truth', [
        ('1-2_26_8a6iVf0GnhbE_MC2junnlEcwUF', 'img-3777.png'),
        ('1OobquZPj1P16zoXBnBFORf2aKKFR4H3l', 'campana-551004696.jpg'),
        ('1pMov8jLJ5DEejT-8SzWMOQDbNpUjSI78', 'campana-548805087.jpg'),
        ('1rmMGjpc0Rl1d1xKA9OiCEq2UMTd4i-_H', 'campana-553158886.jpg'),
        ('1dcwWVXIAchcwQ4wRk72b5bz8NeQABHst', 'campana-544747437.jpg'),
        ('1TneTG70WxviGGdIxeeaTXxo4JCUa03G8', 'campana-538627219.jpg'),
        ('1Q7K2u4QKOgSSb0gaoV2PiCVorA9TyiFy', 'campana-515047550.jpg'),
        ('16YRtTwGp72PDqm1Nvj8fwbNnW48dt2_y', 'campana-514422392.jpg'),
        ('1HLhyAqNvdkuKQWNIhc-c2XFSXVpiS1sq', 'campana-7369e56d.jpg'),
        ('1L_1iwYaMrHd6_t50f9bia17VvK9Iq_ZP', 'campana-486609765.jpg')]),
    # c014 Les ondes de la parole publique: carpeta VACÍA en Drive (2026-08-03)
    ('c015', 'voix-des-survivants', [
        ('18I_ou7PDa8j-f7TZx5NDsKPtsi_MB_oU', 'img-4444.jpg'),
        ('1bov1E0He3y-HVQiELzr4Nwl-5SLHJQz7', 'img-8483.jpg'),
        ('11Gg3mdgFG0irYjA5FG6eLeiSVOsbkKvW', 'img-8482.jpg'),
        ('1ktEQqcwdQvydzI6HLy3OTDCVG8_hWnLO', 'img-8484.jpg'),
        ('1yyorqzyPICcA49udvMnjJr-dFKFqreJi', 'img-5314.jpg'),
        ('1MAI2kN-idlRIzR47S37Vw-kSK93dfsUw', 'img-5315.jpg')]),
    ('c016', 'simecpe', [
        ('1ldrls41JuPGrOFpA_caGTJYkuFzKefGp', 'informe-poder-liderazgo.pdf'),
        ('1RshgbrdAOJduRk72YnXJ6S8tMvKeTStx', 'images.jpg'),
        ('1s1-ZTSsYTUFc3QZpr3XRJZMYVUkS5gL1', 'instagram-652111745.jpg')]),
    ('c017', 'ancla-de-voces', [
        ('1fxBW-iD_DrDiG-3uXmglAug-OPps4lCu', 'metricas-caribe-stereo.pdf')]),
    ('c018', 'valuebot', [
        ('1X_c88VfsN9E6zkE_DfBocrRP-XwLzQb7', 'matriz-valor-publico.png'),
        ('1py8GvNqKOXzl1qcekEXYHTyErUhXaImB', 'openpsm-banda.pdf'),
        ('1ijEA58KIILVqwtng1CZZMO-bLeLoMsvG', 'banda-black-valuebot.pdf')]),
    ('c019', 'elvia-derechos', [
        ('1s5HFvSQRyclwbPHU5ssAkLSSgo7leXod', 'elvia-derechos.png'),
        ('1giVt0PqxQjH_P7FVGzMXFgSr4v5utrLx', 'pantalla-navegador.png'),
        ('1PBbE4q4gnUIQGxeqtdxWTVMBsNO4kBIo', 'presentacion-1.jpeg'),
        ('1Wgl7kTRrpsGouNwTMV1GcSViWz3hJ7ik', 'logotipo-transparente.png')]),
    ('c020', 'ecos-cienaga-oro', [
        ('19u00eHEyd9E0MpmikySiNNCEJlsJew8e', 'latina-stereo-1.jpg'),
        ('132F2TSpldpTAqJDS9KP_ODfZ_szh2Kfk', 'latina-stereo-2.jpg'),
        ('1h3ZoNP8D1wZcQx9jj2uQx8Jkn863I6d-', 'latina-stereo-3.jpg'),
        ('1260moiNEvopv49ih6mGg5Q3xOxaOToFq', 'latina-stereo-4.jpg'),
        ('1gbYe8KsXKrEFOCHiRHpyArLtC878gDjx', 'latina-stereo-5.jpg')]),
]


def main():
    total, err = 0, 0
    for cid, slug, files in MATERIAL:
        folder = os.path.join(DEST, f'{cid}_{slug}')
        os.makedirs(folder, exist_ok=True)
        for fid, name in files:
            path = os.path.join(folder, name)
            if os.path.exists(path) and os.path.getsize(path) > 1000:
                continue
            url = f'https://drive.google.com/uc?export=download&id={fid}'
            try:
                urllib.request.urlretrieve(url, path)
                size = os.path.getsize(path)
                # Si Drive devolvió HTML (archivo grande con interstitial), reintentar con confirm
                head = open(path, 'rb').read(15)
                if head.startswith(b'<!DOCTYPE') or head.startswith(b'<html'):
                    url2 = f'https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t'
                    urllib.request.urlretrieve(url2, path)
                    size = os.path.getsize(path)
                print(f'{cid}/{name}: {size // 1024} KB')
                total += 1
            except Exception as e:
                print(f'ERROR {cid}/{name}: {e}')
                err += 1
    print(f'\nDescargados: {total} · Errores: {err}')


if __name__ == '__main__':
    main()
