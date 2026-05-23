package ro.after.api.translator;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/translator")
public class TranslatorController {

    private static final Map<String, String> DICTIONARY = new LinkedHashMap<>();

    static {
        DICTIONARY.put("certificat de deces",
                "Documentul oficial eliberat de Starea Civilă care confirmă decesul. Este nevoie de mai multe exemplare originale pentru bancă, succesiune, angajator și pentru radieri.");
        DICTIONARY.put("certificat constatator",
                "Document eliberat de notar la deschiderea succesiunii, care confirmă cine sunt moștenitorii și ce bunuri există. Notarul îl întocmește pe baza actelor pe care i le predai.");
        DICTIONARY.put("certificat de mostenitor",
                "Documentul final emis de notar la sfârșitul succesiunii. Atestă cine sunt moștenitorii și care e cota fiecăruia din bunuri.");
        DICTIONARY.put("adeverinta de mostenitor",
                "O variantă simplificată, eliberată tot de notar, folosită când nu există imobile de transferat — utilă pentru pensii, conturi mici și anumite proceduri.");
        DICTIONARY.put("dezbatere succesorala",
                "Procedura prin care notarul stabilește moștenitorii și împarte bunurile. Se face de obicei la notarul din raza ultimului domiciliu al persoanei decedate.");
        DICTIONARY.put("succesiune",
                "Procesul legal prin care bunurile rămân în proprietatea moștenitorilor. Termenul recomandat este de 2 ani de la deces ca să eviți taxe suplimentare.");
        DICTIONARY.put("declaratie succesorala",
                "Declarație notarială prin care un moștenitor acceptă sau renunță expres la moștenire. Este parte din dosarul de succesiune.");
        DICTIONARY.put("masa succesorala",
                "Totalitatea bunurilor, datoriilor și drepturilor pe care le lasă persoana decedată. Notarul o inventariază înainte de partaj.");
        DICTIONARY.put("ajutor de inmormantare",
                "Sumă acordată de stat (prin Casa de Pensii sau angajator) persoanei care a suportat cheltuielile de înmormântare. Necesită certificat de deces și facturi.");
        DICTIONARY.put("anexa 23",
                "Cerere către Casa de Pensii pentru ajutorul de înmormântare în cazul pensionarilor. Se depune împreună cu certificatul de deces, actele de identitate și facturile.");
        DICTIONARY.put("cnp",
                "Codul Numeric Personal — identificatorul unic al persoanei în România. Este necesar în aproape toate formularele oficiale.");
        DICTIONARY.put("certificat medical constatator",
                "Documentul eliberat de medic care confirmă decesul și cauza. E primul document de care ai nevoie — pe baza lui se eliberează certificatul de deces.");
        DICTIONARY.put("evidenta persoanelor",
                "Direcția care emite și anulează cărțile de identitate și pașapoartele. Aici predai actele persoanei decedate pentru anulare.");
        DICTIONARY.put("drpciv",
                "Direcția Regim Permise de Conducere și Înmatriculare a Vehiculelor. Aici se transferă sau se radiază autovehiculul persoanei decedate.");
        DICTIONARY.put("onrc",
                "Oficiul Național al Registrului Comerțului. Aici se actualizează datele despre asociați și administratori dacă persoana decedată avea o firmă.");
        DICTIONARY.put("cartea funciara",
                "Registrul oficial al proprietăților imobiliare. După succesiune, moștenitorii se înscriu aici ca noi proprietari.");
        DICTIONARY.put("intabulare",
                "Înscrierea oficială a dreptului de proprietate în Cartea Funciară. După succesiune, se face pe baza certificatului de moștenitor.");
        DICTIONARY.put("roeid",
                "Identitatea electronică oficială a statului român. Permite autentificare sigură în servicii publice și semnarea unor documente.");
        DICTIONARY.put("starea civila",
                "Compartimentul din primărie care înregistrează nașterile, căsătoriile și decesele și eliberează certificatele corespunzătoare.");
    }

    public record ExplainRequest(
            @NotBlank @Size(min = 2, max = 200) String term
    ) {}

    public record ExplainResponse(String term, String explanation, boolean known) {}

    public record SuggestionResponse(List<String> suggestions) {}

    @PostMapping
    public ExplainResponse explain(@Valid @RequestBody ExplainRequest req) {
        String key = normalize(req.term());
        String found = DICTIONARY.get(key);
        if (found == null) {
            for (var e : DICTIONARY.entrySet()) {
                if (key.contains(e.getKey()) || e.getKey().contains(key)) {
                    found = e.getValue();
                    break;
                }
            }
        }
        if (found != null) {
            return new ExplainResponse(req.term().trim(), found, true);
        }
        return new ExplainResponse(req.term().trim(),
                "Pe înțelesul tuturor: este un pas administrativ care ajută la dovedirea calității tale " +
                "în relația cu o instituție. Nu trebuie să-l rezolvi singur acum — te ghidăm pas cu pas " +
                "atunci când va fi momentul. Dacă vrei, încarcă documentul în Centrul de documente și ți-l explicăm punctual.",
                false);
    }

    @GetMapping("/suggestions")
    public SuggestionResponse suggestions() {
        return new SuggestionResponse(List.of(
                "Certificat de deces", "Anexa 23", "Declarație succesorală",
                "Certificat de moștenitor", "Ajutor de înmormântare", "Cartea Funciară"
        ));
    }

    private String normalize(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .trim();
        return n.replaceAll("\\s+", " ");
    }
}
